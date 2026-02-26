import { format, formatDistanceToNow, parseISO, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns';
import { ru as ruLocale } from 'date-fns/locale';
import i18n from '@shared/i18n';

export function getLocale() {
  return i18n.language === 'ru' ? ruLocale : undefined;
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  const locale = getLocale();
  if (isToday(date)) return i18n.t('common.today');
  if (isYesterday(date)) return i18n.t('common.yesterday');
  return format(date, 'd MMM yyyy', { locale });
}

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  const locale = getLocale();
  return format(date, 'd MMM yyyy, HH:mm', { locale });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm');
}

export function formatRelative(dateStr: string): string {
  const locale = getLocale();
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale });
}

export function getNextOccurrence(timeOfDay: string): Date {
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

export function minutesUntil(timeOfDay: string): number {
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return Infinity;
  const next = getNextOccurrence(timeOfDay);
  return differenceInMinutes(next, new Date());
}

export function formatCountdown(minutes: number): string {
  const isRu = i18n.language === 'ru';
  if (minutes < 60) return isRu ? `${minutes} мин` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (isRu) return m > 0 ? `${h}ч ${m}мин` : `${h}ч`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function hoursSince(dateString: string): number {
  return differenceInHours(new Date(), parseISO(dateString));
}
