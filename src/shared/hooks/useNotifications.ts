import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import i18n from '@shared/i18n';

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

      // On Android 12+, exact alarm permission may not be auto-granted.
      // Without it, notifications use inexact alarms and arrive late.
      await promptExactAlarmIfNeeded();
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
      // Open the app's notification settings — the nearest available surface
      // where the user can find Alarms & Reminders toggle
      await Linking.openSettings();
    }
  } catch {
    // Permission API shape varies across SDK versions — fail silently
  }
}

/**
 * Restore injection/feeding notifications on app startup.
 * Android may drop scheduled notifications after app update, force-stop,
 * or battery optimization. This re-registers them from the DB schedules.
 */
export async function restoreScheduleNotifications(): Promise<void> {
  const { storage, StorageKeys } = await import('@storage/mmkv/storage');
  const { scheduleRepository, petRepository } = await import('@storage/database');

  // Only restore if user explicitly enabled notifications
  if (storage.getBoolean(StorageKeys.NOTIFICATIONS_ENABLED) !== true) return;

  // Check permissions without prompting
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  // Get active pet
  const activePetId = storage.getString(StorageKeys.ACTIVE_PET_ID);
  if (!activePetId) return;

  const pet = await petRepository.findById(activePetId);
  if (!pet) return;

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

  // Re-schedule from DB
  const injectionTimes = await scheduleRepository.getInjectionTimes(activePetId);
  for (const s of injectionTimes) {
    const [hours, minutes] = s.timeOfDay.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.injectionTitle', { petName: pet.name }),
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
  }

  const feedingTimes = await scheduleRepository.getFeedingTimes(activePetId);
  for (const s of feedingTimes) {
    const [hours, minutes] = s.timeOfDay.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.feedingTitle', { petName: pet.name }),
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
  }
}
