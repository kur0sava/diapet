/**
 * Клиентский блок-лист пользователей (v2.6). Google Play/RuStore требуют для
 * UGC возможность заблокировать участника. Полноценный серверный бан —
 * отдельная работа (за владельцем); этот слой мгновенно и без бэкенда прячет
 * ВСЕ сообщения/темы заблокированного локально у того, кто заблокировал.
 */
import { storage } from '@storage/mmkv/storage';

const KEY = 'communityBlockedUids';

export function getBlocked(): string[] {
  try {
    const raw = storage.getString(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function isBlocked(uid: string): boolean {
  if (!uid) return false;
  return getBlocked().includes(uid);
}

export function blockUser(uid: string): void {
  if (!uid) return;
  const list = getBlocked();
  if (!list.includes(uid)) {
    list.push(uid);
    storage.set(KEY, JSON.stringify(list));
  }
}

export function unblockUser(uid: string): void {
  const list = getBlocked().filter(u => u !== uid);
  storage.set(KEY, JSON.stringify(list));
}
