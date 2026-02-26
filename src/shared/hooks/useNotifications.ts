import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    }

    return finalStatus === 'granted';
  };

  const scheduleInjectionReminder = async (time: string, petName: string): Promise<string> => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💉 Время укола для ${petName}`,
        body: `Не забудьте сделать инъекцию инсулина!`,
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
        title: `🍽️ Время кормления ${petName}`,
        body: `Пора покормить вашего питомца!`,
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

  return {
    requestPermissions,
    scheduleInjectionReminder,
    scheduleFeedingReminder,
    cancelAllNotifications,
  };
}
