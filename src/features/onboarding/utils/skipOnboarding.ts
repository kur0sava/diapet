import { storage, StorageKeys } from '@storage/mmkv/storage';
import { startTrial } from '@features/subscription/utils/trial';
import { logEvent } from '@shared/analytics/analytics';

/**
 * Commit onboarding as "done" for a user who chose to look around instead of
 * registering a pet first (encyclopedia + emergency are the reason many people
 * install the app at 11pm, and gating them behind a 6-screen setup loses them).
 *
 * Why this MUST write ONBOARDING_COMPLETE rather than just navigating away:
 * runStartupRecovery() treats "flag false + a pet created minutes ago" as an
 * interrupted onboarding and DELETES that pet. AddPetScreen deliberately never
 * touches the flag, so a browsing user who later added a pet would silently
 * lose it on the next cold start.
 *
 * Mirrors the commit block in NotificationsScreen.handleFinish minus everything
 * pet-specific (no ACTIVE_PET_ID / ACTIVE_SPECIES — there is no pet yet, and a
 * dangling pointer would make ThemeContext render a dead pet's species color).
 * ONBOARDING_COMPLETE stays the last write for the same crash-ordering reason.
 */
export function skipOnboardingToBrowse(): void {
  storage.set(StorageKeys.NOTIFICATIONS_ENABLED, false);
  storage.set(StorageKeys.HINTS_REGISTRATION_DATE, new Date().toISOString());
  // Idempotent; keeps trial accounting identical to the normal path.
  startTrial();
  storage.set(StorageKeys.ONBOARDING_COMPLETE, true);
  storage.delete(StorageKeys.ONBOARDING_DRAFT);
  logEvent('onboarding_skipped', { reason: 'browse' });
}
