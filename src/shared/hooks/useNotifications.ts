import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import i18n from '@shared/i18n';
import { storage as mmkvStorage, StorageKeys as MMKVKeys } from '@storage/mmkv/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('injections', {
        name: 'Инъекции / Injections',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F8EF7',
      });
      await Notifications.setNotificationChannelAsync('feedings', {
        name: 'Кормление / Feedings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#34C759',
      });
      await Notifications.setNotificationChannelAsync('hints', {
        name: 'Подсказки / Tips',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#FFD700',
      });
      await Notifications.setNotificationChannelAsync('glucose', {
        name: 'Замеры глюкозы / Glucose checks',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9500',
      });

      // Follow-up guidance only makes sense when the user actually granted
      // notifications — otherwise we'd nag someone who just said "no".
      if (finalStatus === 'granted') {
        // On Android 12+, exact alarm permission may not be auto-granted.
        // Without it, notifications use inexact alarms and arrive late.
        await promptExactAlarmIfNeeded();

        // Aggressive OEM battery managers force-stop the app and break the
        // reminder re-scheduling chain (see promptBatteryOptimizationIfNeeded).
        await promptBatteryOptimizationIfNeeded();
      }
    }

    return finalStatus === 'granted';
  };

  const scheduleInjectionReminder = async (time: string, petName: string): Promise<string> => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.injectionTitle', { petName }),
        body: i18n.t('notifications.injectionBody'),
        sound: true,
        data: { type: 'injection' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'injections',
      },
    });
    return id;
  };

  const scheduleFeedingReminder = async (time: string, petName: string): Promise<string> => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.feedingTitle', { petName }),
        body: i18n.t('notifications.feedingBody'),
        sound: true,
        data: { type: 'feeding' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'feedings',
      },
    });
    return id;
  };

  const cancelAllNotifications = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  /** Cancel only injection/feeding notifications, preserving hint pushes */
  const cancelScheduleNotifications = async (): Promise<void> => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      const type = (n.content.data as { type?: string })?.type;
      if (type === 'injection' || type === 'feeding') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  };

  return {
    requestPermissions,
    scheduleInjectionReminder,
    scheduleFeedingReminder,
    cancelAllNotifications,
    cancelScheduleNotifications,
  };
}

/**
 * On Android 12+ (API 31+), SCHEDULE_EXACT_ALARM may not be auto-granted.
 * Without it, expo-notifications falls back to inexact alarms that Android
 * batches and delays — the main cause of "notifications not on time."
 * Opens app's system settings so the user can grant the exact alarm permission.
 */
async function promptExactAlarmIfNeeded(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const perms = await Notifications.getPermissionsAsync();
    // expo-notifications exposes canScheduleExactAlarms on Android 12+
    const android = (perms as { android?: { allowsExactAlarms?: boolean } }).android;
    if (android && 'allowsExactAlarms' in android && android.allowsExactAlarms === false) {
      // Explain BEFORE navigating away — previously this called openSettings()
      // directly and the user was dumped into system settings mid-onboarding
      // with no idea why. Shown once (MMKV flag), same pattern as the battery
      // optimization prompt below.
      const { storage, StorageKeys } = await import('@storage/mmkv/storage');
      if (storage.getBoolean(StorageKeys.EXACT_ALARM_PROMPTED)) return;
      storage.set(StorageKeys.EXACT_ALARM_PROMPTED, true);

      Alert.alert(i18n.t('notifications.exactAlarmTitle'), i18n.t('notifications.exactAlarmBody'), [
        { text: i18n.t('notifications.batteryLater'), style: 'cancel' },
        {
          text: i18n.t('notifications.exactAlarmOpen'),
          onPress: () => {
            void Linking.openSettings().catch(() => {});
          },
        },
      ]);
    }
  } catch {
    // Permission API shape varies across SDK versions — fail silently
  }
}

/**
 * On many Android OEMs (Xiaomi, Huawei, Samsung, Oppo — very common in RU) the
 * app process is force-stopped by aggressive battery management. expo-notifications
 * schedules each DAILY reminder as a one-shot exact alarm that re-schedules the
 * next day's alarm *from inside the app process* when it fires. Once the OS kills
 * the process that chain breaks: the user gets one reminder (right after a reboot
 * / app open), then nothing until the app is opened again and
 * restoreScheduleNotifications() rebuilds the alarms. Excluding the app from
 * battery optimization keeps the process alive so re-scheduling survives.
 *
 * Shown once (gated by a MMKV flag) so we don't nag on every notification enable.
 * Non-blocking: never rejects, never holds up the permission flow.
 */
async function promptBatteryOptimizationIfNeeded(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { storage, StorageKeys } = await import('@storage/mmkv/storage');
    if (storage.getBoolean(StorageKeys.BATTERY_OPT_PROMPTED)) return;
    storage.set(StorageKeys.BATTERY_OPT_PROMPTED, true);

    Alert.alert(i18n.t('notifications.batteryTitle'), i18n.t('notifications.batteryBody'), [
      { text: i18n.t('notifications.batteryLater'), style: 'cancel' },
      {
        text: i18n.t('notifications.batteryOpen'),
        onPress: () => {
          void openBatteryOptimizationSettings();
        },
      },
    ]);
  } catch {
    // Never block the permission flow on this optional guidance
  }
}

async function openBatteryOptimizationSettings(): Promise<void> {
  try {
    // System list of apps with battery-optimization status; user unrestricts
    // DiaPet. Works cross-OEM and needs no extra permission.
    await Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  } catch {
    try {
      await Linking.openSettings();
    } catch {
      // Give up silently — the reminder still works while the app is open
    }
  }
}

/**
 * Re-entrancy guard. AppContent triggers restore on mount AND on every
 * AppState 'active' transition; a slow Android cold start can fire both
 * within milliseconds. Without this, two concurrent runs interleave their
 * cancel/schedule loops and produce duplicate alarms (audit BUG-H005).
 *
 * BUG-H002: a call that arrives while a restore is in flight must NOT be
 * dropped — EditPet fires one right after changing the schedule, and losing
 * it would leave the OS alarms on the OLD times until the next foreground.
 * Instead it sets restoreQueued and the active run loops once more, reading
 * the fresh DB state. Multiple queued calls coalesce into a single rerun.
 */
let isRestoring = false;
let restoreQueued = false;

/**
 * Restore injection/feeding notifications on app startup.
 *
 * Re-schedules reminders for ALL pets in the DB (not just the active one):
 * a household with two diabetic pets needs both sets of alarms regardless
 * of which pet is currently selected on the dashboard. Previously this
 * cancelled all injection/feeding alarms and rebuilt only the active pet's,
 * silently disabling the inactive pet's reminders on every foreground.
 *
 * Android may drop scheduled notifications after app update, force-stop,
 * or battery optimization, so we accept the "rebuild on every active"
 * cost — the re-entrancy guard above keeps it bounded to one rebuild at
 * a time.
 */
export async function restoreScheduleNotifications(): Promise<void> {
  if (isRestoring) {
    restoreQueued = true;
    return;
  }
  isRestoring = true;
  try {
    do {
      restoreQueued = false;
      await doRestoreScheduleNotifications();
    } while (restoreQueued);
  } finally {
    isRestoring = false;
  }
}

async function doRestoreScheduleNotifications(): Promise<void> {
  const { storage, StorageKeys } = await import('@storage/mmkv/storage');
  const { scheduleRepository, petRepository } = await import('@storage/database');

  // Check permissions without prompting
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  // Glucose-measurement reminders sit behind their own Settings toggle,
  // independent of the injection/feeding master flag below — a user may want
  // only measurement nudges without ever enabling schedule reminders.
  if (storage.getBoolean(StorageKeys.GLUCOSE_REMINDER_ENABLED) === true) {
    await scheduleGlucoseReminders().catch(() => {});
  }

  // Only restore schedule reminders if user explicitly enabled notifications
  if (storage.getBoolean(StorageKeys.NOTIFICATIONS_ENABLED) !== true) return;

  const pets = await petRepository.findActive();
  if (pets.length === 0) return;

  // Ensure Android channels exist (may be missing after app update or data clear)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('injections', {
      name: 'Инъекции / Injections',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F8EF7',
    });
    await Notifications.setNotificationChannelAsync('feedings', {
      name: 'Кормление / Feedings',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#34C759',
    });
  }

  // Cancel existing schedule notifications (keep hint pushes)
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    const type = (n.content.data as { type?: string })?.type;
    if (type === 'injection' || type === 'feeding') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Re-schedule from DB for every pet
  for (const pet of pets) {
    const injectionTimes = await scheduleRepository.getInjectionTimes(pet.id);
    for (const s of injectionTimes) {
      const [hours, minutes] = s.timeOfDay.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.injectionTitle', { petName: pet.name }),
          body: i18n.t('notifications.injectionBody'),
          sound: true,
          data: { type: 'injection', petId: pet.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: 'injections',
        },
      });
    }

    const feedingTimes = await scheduleRepository.getFeedingTimes(pet.id);
    for (const s of feedingTimes) {
      const [hours, minutes] = s.timeOfDay.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.feedingTitle', { petName: pet.name }),
          body: i18n.t('notifications.feedingBody'),
          sound: true,
          data: { type: 'feeding', petId: pet.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: 'feedings',
        },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Glucose-measurement reminders (v2.6 retention, batch 3.1)
// ---------------------------------------------------------------------------

export const DEFAULT_GLUCOSE_REMINDER_TIMES = ['08:00', '20:00'];
export const MAX_GLUCOSE_REMINDER_TIMES = 6;

/** Read the configured reminder times ("HH:mm") from MMKV, with fallback. */
export function getGlucoseReminderTimes(): string[] {
  try {
    const raw = mmkvStorage.getString(MMKVKeys.GLUCOSE_REMINDER_TIMES);
    if (!raw) return [...DEFAULT_GLUCOSE_REMINDER_TIMES];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_GLUCOSE_REMINDER_TIMES];
    const valid = parsed.filter(
      (t): t is string => typeof t === 'string' && /^\d{1,2}:\d{2}$/.test(t)
    );
    return valid.length > 0 ? valid : [...DEFAULT_GLUCOSE_REMINDER_TIMES];
  } catch {
    return [...DEFAULT_GLUCOSE_REMINDER_TIMES];
  }
}

export async function cancelGlucoseReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as { type?: string })?.type === 'glucose_reminder') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/**
 * (Re)schedule daily glucose-measurement reminders from MMKV state.
 * Idempotent: cancels existing glucose reminders first, so it is safe to call
 * from both the Settings toggle and every restore pass.
 */
export async function scheduleGlucoseReminders(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('glucose', {
      name: 'Замеры глюкозы / Glucose checks',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9500',
    });
  }

  await cancelGlucoseReminders();

  for (const time of getGlucoseReminderTimes().slice(0, MAX_GLUCOSE_REMINDER_TIMES)) {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.glucoseTitle'),
        body: i18n.t('notifications.glucoseBody'),
        sound: true,
        data: { type: 'glucose_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'glucose',
      },
    });
  }
}
