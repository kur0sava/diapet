import { storage, StorageKeys } from '@storage/mmkv/storage';
import { petRepository } from '@storage/database';

/**
 * Pets created within this window before launch are treated as leftovers of an
 * interrupted onboarding (process killed between petRepository.create and the
 * ONBOARDING_COMPLETE write in NotificationsScreen — a gap of milliseconds).
 * Anything older cannot be an onboarding orphan and must never be deleted.
 */
export const INTERRUPTED_ONBOARDING_WINDOW_MS = 10 * 60 * 1000;

/**
 * Small tolerance for the system clock being adjusted backwards (NTP sync)
 * between pet creation and the next launch. Timestamps further in the future
 * than this are treated as NOT recent: a future created_at is impossible for
 * a genuine onboarding orphan but plausible for a DB restored onto a device
 * whose clock lags the old one — and that data must be adopted, not purged.
 */
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

function isOnboardingOrphanCandidate(createdAtIso: string, now: number): boolean {
  const createdAt = Date.parse(createdAtIso);
  if (!Number.isFinite(createdAt)) return false; // unparseable → never delete
  const age = now - createdAt;
  return age > -CLOCK_SKEW_TOLERANCE_MS && age < INTERRUPTED_ONBOARDING_WINDOW_MS;
}

/**
 * BUG-C001: startup recovery when ONBOARDING_COMPLETE is missing.
 *
 * Two very different situations look identical at this point:
 *
 * 1. Interrupted onboarding — the previous run crashed after creating the pet
 *    but before the ONBOARDING_COMPLETE commit write. The pet row is seconds
 *    old and safe to purge so the re-run of onboarding doesn't duplicate it.
 *
 * 2. Restored install — the SQLite DB survived (Android auto-backup, device
 *    migration, future in-app restore) but MMKV came up empty because its
 *    encryption key lives in the Keystore, which does NOT transfer between
 *    devices. Here the DB holds the user's entire history; purging it would
 *    silently destroy months of medical data via ON DELETE CASCADE.
 *
 * The discriminator is pet age: an onboarding orphan is minutes old, restored
 * data is not. If ANY pet falls outside the interrupted-onboarding window we
 * adopt the data instead of purging — rebuild the MMKV pointers, mark
 * onboarding complete, and let the app boot straight into the dashboard.
 * When in doubt (unparseable/future timestamps) we adopt: booting into a
 * spurious dashboard is recoverable, deleting a diabetic pet's history is not.
 */
export async function runStartupRecovery(): Promise<void> {
  if (storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)) return;

  try {
    const existing = await petRepository.findActive();
    const now = Date.now();
    const established = existing.filter(p => !isOnboardingOrphanCandidate(p.createdAt, now));

    if (established.length > 0) {
      // Non-destructive adoption. findActive orders by created_at ASC, so
      // established[0] is the oldest pet — the least likely to be spurious.
      const active = established[0];
      storage.set(StorageKeys.ACTIVE_PET_ID, active.id);
      storage.set(StorageKeys.ACTIVE_SPECIES, active.species);
      // The hints-registration fallback in bootstrap() already ran (and was
      // skipped, since the flag was still false), so backfill it here.
      if (!storage.getString(StorageKeys.HINTS_REGISTRATION_DATE)) {
        storage.set(StorageKeys.HINTS_REGISTRATION_DATE, new Date().toISOString());
      }
      // NOTIFICATIONS_ENABLED stays unset (off): OS-level scheduled alarms
      // don't survive a device migration anyway, and the user re-enables in
      // Settings. Commit write goes last, mirroring onboarding's ordering.
      storage.set(StorageKeys.ONBOARDING_COMPLETE, true);
      return;
    }

    // Genuine interrupted onboarding (or fresh install): purge orphaned pets
    // so the re-run of onboarding doesn't leave duplicates behind. Also wipe
    // MMKV pointers/per-pet keys so the next launch's ThemeContext doesn't
    // briefly render the dead pet's species color before the re-onboarded
    // pet is created (audit BUG-H002).
    for (const p of existing) await petRepository.delete(p.id);
    storage.delete(StorageKeys.ACTIVE_PET_ID);
    storage.delete(StorageKeys.ACTIVE_SPECIES);
    storage.delete(StorageKeys.NOTIFICATIONS_ENABLED);
    // Sweep stranded per-pet vet keys whose petId is no longer in DB.
    // petRepository.delete already nukes them for known pet ids, but an
    // interrupted handleFinish may have written one before the pet row was
    // even committed.
    for (const key of storage.getAllKeys()) {
      if (key.startsWith('vetName_') || key.startsWith('vetPhone_')) {
        storage.delete(key);
      }
    }
  } catch {
    /* best-effort recovery */
  }
}
