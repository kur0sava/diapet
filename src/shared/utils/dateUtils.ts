import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isYesterday,
  differenceInMinutes,
  differenceInHours,
} from 'date-fns';
import { ru as ruLocale } from 'date-fns/locale';
import i18n from '@shared/i18n';

export function getLocale() {
  return i18n.language === 'ru' ? ruLocale : undefined;
}

/**
 * Parse a date-only string (YYYY-MM-DD) without UTC timezone shift.
 * Appends T12:00:00 so the date stays correct in any timezone.
 */
export function parseDateOnly(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00`);
  }
  return new Date(dateStr);
}

/**
 * Format a Date as YYYY-MM-DD in the LOCAL timezone.
 * Using `.toISOString().slice(0, 10)` would return the UTC date, shifting by
 * one day for users east of Greenwich in the late-evening hours or users west
 * of Greenwich in the early-morning hours.
 */
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's date as YYYY-MM-DD in the device's local timezone. */
export function todayLocal(): string {
  return toDateOnly(new Date());
}

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const locale = getLocale();
    if (isToday(date)) return i18n.t('common.today');
    if (isYesterday(date)) return i18n.t('common.yesterday');
    return format(date, 'd MMM yyyy', { locale });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const locale = getLocale();
    return format(date, 'd MMM yyyy, HH:mm', { locale });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const locale = getLocale();
    const pattern = i18n.language === 'ru' ? 'dd.MM' : 'MM/dd';
    return format(parseISO(dateStr), pattern, { locale });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr: string): string {
  try {
    const locale = getLocale();
    const pattern = i18n.language === 'ru' ? 'dd.MM.yyyy' : 'MM/dd/yyyy';
    return format(parseISO(dateStr), pattern, { locale });
  } catch {
    return dateStr;
  }
}

export function formatFullDateTime(dateStr: string): string {
  try {
    const locale = getLocale();
    const pattern = i18n.language === 'ru' ? 'dd.MM.yyyy HH:mm' : 'MM/dd/yyyy HH:mm';
    return format(parseISO(dateStr), pattern, { locale });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'HH:mm');
  } catch {
    return '--:--';
  }
}

export function formatRelative(dateStr: string): string {
  try {
    const locale = getLocale();
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale });
  } catch {
    return dateStr;
  }
}

export function getNextOccurrence(timeOfDay: string): Date {
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return new Date(NaN);
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
  if (!isFinite(minutes) || isNaN(minutes)) return '—';
  if (minutes < 60) return isRu ? `${minutes} мин` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (isRu) return m > 0 ? `${h}ч ${m}мин` : `${h}ч`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function hoursSince(dateString: string): number {
  return differenceInHours(new Date(), parseISO(dateString));
}
