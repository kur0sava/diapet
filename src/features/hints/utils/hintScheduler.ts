import * as Notifications from 'expo-notifications';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { PUSH_HINTS } from '../data/pushContent';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import i18n from '@shared/i18n';
import { isBackendConfigured } from '@shared/api/subscriptionApi';
import { usePetStore } from '@shared/stores/petStore';

/**
 * Schedule hint push notifications for the post-30-day period.
 * Called from AppContent on mount. Schedules 3 notifications per week,
 * rotating through unused PUSH_HINTS content.
 *
 * Logic:
 * 1. Check if user is past 30 days
 * 2. Check if we already scheduled this week (HINTS_PUSH_LAST_SCHEDULED)
 * 3. Cancel old hint pushes
 * 4. Pick 3 unshown push hints
 * 5. Schedule them for random days/times this week
 * 6. Update MMKV state
 */
export async function scheduleHintPushNotifications(): Promise<void> {
  const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
  if (!regDate) return;

  const daysSince = differenceInDays(new Date(), parseISO(regDate));
  if (daysSince < 30) return; // Still in free hints period

  // Check if already scheduled within last 5 days
  const lastScheduled = storage.getString(StorageKeys.HINTS_PUSH_LAST_SCHEDULED);
  if (lastScheduled) {
    const daysSinceScheduled = differenceInDays(new Date(), parseISO(lastScheduled));
    if (daysSinceScheduled < 5) return; // Already scheduled recently
  }

  // Get shown IDs
  const shownRaw = storage.getString(StorageKeys.HINTS_PUSH_SHOWN_IDS);
  let shownIds: string[] = [];
  try {
    shownIds = shownRaw ? JSON.parse(shownRaw) : [];
  } catch {
    shownIds = [];
  }

  // Filter by species and premium availability. This runs from AppContent
  // mount, often BEFORE loadPets() resolves — activePet is still null then,
  // so fall back to the MMKV species cache (written on every pet switch)
  // rather than defaulting dog owners to cat content.
  const species =
    usePetStore.getState().activePet?.species ??
    (storage.getString(StorageKeys.ACTIVE_SPECIES) as 'cat' | 'dog' | undefined) ??
    'cat';
  const backendReady = isBackendConfigured();
  const eligibleHints = PUSH_HINTS.filter(h => {
    if (h.mentionsPremium && !backendReady) return false;
    if (h.species && h.species !== 'all' && h.species !== species) return false;
    return true;
  });

  // Pick 3 unshown hints
  const available = eligibleHints.filter(h => !shownIds.includes(h.id));
  if (available.length === 0) {
    // All shown — reset and start over
    shownIds = [];
    storage.set(StorageKeys.HINTS_PUSH_SHOWN_IDS, '[]');
  }

  const toSchedule = (available.length > 0 ? available : eligibleHints).slice(0, 3);
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ru';

  // Cancel previous hint notifications
  await cancelAllHintPushNotifications();

  // Schedule 3 notifications spread across next 7 days
  const newShownIds = [...shownIds];
  for (let i = 0; i < toSchedule.length; i++) {
    const hint = toSchedule[i];
    const daysFromNow = i * 2 + 1; // day 1, 3, 5
    const triggerDate = addDays(new Date(), daysFromNow);
    // Random hour between 10:00 and 18:00
    const hour = 10 + Math.floor(Math.random() * 8);
    triggerDate.setHours(hour, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: species === 'dog' ? 'DiaPet \uD83D\uDC36' : 'DiaPet \uD83D\uDC31',
        body: hint[lang],
        sound: false,
        data: { type: 'hint', hintId: hint.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'hints',
      },
    });

    newShownIds.push(hint.id);
  }

  // Update state
  storage.set(StorageKeys.HINTS_PUSH_SHOWN_IDS, JSON.stringify(newShownIds));
  storage.set(StorageKeys.HINTS_PUSH_LAST_SCHEDULED, new Date().toISOString());
}

export async function cancelAllHintPushNotifications(): Promise<void> {
  // Get all scheduled notifications and cancel only hint ones
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'hint') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}
