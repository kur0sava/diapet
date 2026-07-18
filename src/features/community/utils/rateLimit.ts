/**
 * Клиентский rate-limit сообщений (v2.6) — первая линия анти-спама/анти-cost
 * (плановая модель модерации «слоями»). Не paywall, одинаков для всех:
 * щедрый дневной лимит + короткий кулдаун. Серверные правила Firestore —
 * вторая линия (деплой пользователем).
 */
import { storage } from '@storage/mmkv/storage';

const DAILY_LIMIT = 40;
const COOLDOWN_MS = 5_000;

const COUNT_KEY = 'communityMsgCount';
const DATE_KEY = 'communityMsgDate';
const LAST_KEY = 'communityMsgLastTs';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export type RateVerdict = 'ok' | 'cooldown' | 'daily_limit';

export function checkRateLimit(): RateVerdict {
  const now = Date.now();
  const last = storage.getNumber(LAST_KEY) ?? 0;
  if (now - last < COOLDOWN_MS) return 'cooldown';

  const today = todayKey();
  const storedDate = storage.getString(DATE_KEY);
  const count = storedDate === today ? (storage.getNumber(COUNT_KEY) ?? 0) : 0;
  if (count >= DAILY_LIMIT) return 'daily_limit';
  return 'ok';
}

/** Отметить успешную отправку (двигает счётчик и кулдаун). */
export function recordSend(): void {
  const now = Date.now();
  const today = todayKey();
  const storedDate = storage.getString(DATE_KEY);
  const count = storedDate === today ? (storage.getNumber(COUNT_KEY) ?? 0) : 0;
  storage.set(DATE_KEY, today);
  storage.set(COUNT_KEY, count + 1);
  storage.set(LAST_KEY, now);
}
