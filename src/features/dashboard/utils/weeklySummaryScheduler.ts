/**
 * Sunday-evening weekly summary push (v2.6 batch 3.2).
 *
 * Local notifications can't compute content at fire time, so the push body is
 * built from the rolling 7-day stats at scheduling time and refreshed on
 * every app open / foreground: cancel the previously scheduled one, schedule
 * a fresh one for the next Sunday 19:00 local. A daily-logging owner opens
 * the app on Sunday itself, so the numbers are nearly always current.
 */
import * as Notifications from 'expo-notifications';
import i18n from '@shared/i18n';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { glucoseRepository, petRepository } from '@storage/database';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { computeWeeklySummary } from './weeklySummary';

const PUSH_TYPE = 'weekly_summary';
const FIRE_HOUR = 19;

export async function cancelWeeklySummaryPush(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as { type?: string })?.type === PUSH_TYPE) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

function nextSunday(now = new Date()): Date {
  const next = new Date(now);
  next.setHours(FIRE_HOUR, 0, 0, 0);
  const add = (7 - next.getDay()) % 7; // 0 when today IS Sunday
  next.setDate(next.getDate() + add);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 7);
  return next;
}

export async function refreshWeeklySummaryPush(): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const petId = storage.getString(StorageKeys.ACTIVE_PET_ID);
  if (!petId) return;
  const pet = await petRepository.findById(petId);
  if (!pet) return;

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const readings = await glucoseRepository.findSince(petId, since);
  const summary = computeWeeklySummary(readings, getSpeciesConfig(pet.species));

  await cancelWeeklySummaryPush();
  // No measurements this week → no push. A guilt-push over an empty week
  // reads as nagging, and the event-hint system covers re-engagement.
  if (summary.measurements < 1 || summary.tir === null) return;

  let deltaStr = '';
  if (summary.tirDelta !== null && Math.abs(summary.tirDelta) >= 1) {
    const arrow = summary.tirDelta > 0 ? '▲' : '▼';
    deltaStr = ` (${arrow} ${summary.tirDelta > 0 ? '+' : ''}${Math.round(summary.tirDelta)} ${i18n.t('weekly.pp')})`;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('weekly.pushTitle', { petName: pet.name }),
      body: i18n.t('weekly.pushBody', {
        count: summary.measurements,
        tir: Math.round(summary.tir),
        delta: deltaStr,
      }),
      sound: false,
      data: { type: PUSH_TYPE },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday(),
      channelId: 'hints',
    },
  });
}
