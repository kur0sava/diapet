import { storage } from '@storage/mmkv/storage';

/**
 * Persist/restore an in-progress log entry (audit C2). The daily logging
 * screens kept everything in React state only, so an OS kill / incoming call
 * mid-entry lost the reading. Drafts are per-pet, only for NEW entries, expire
 * after a day, and are cleared on a successful save.
 */
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function saveEntryDraft(key: string, petId: string, data: Record<string, unknown>): void {
  try {
    storage.set(key, JSON.stringify({ petId, savedAt: Date.now(), ...data }));
  } catch {
    /* draft persistence is best-effort */
  }
}

export function loadEntryDraft<T extends Record<string, unknown>>(
  key: string,
  petId: string
): T | null {
  try {
    const raw = storage.getString(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { petId?: string; savedAt?: number } & T;
    if (parsed.petId !== petId) return null;
    if (typeof parsed.savedAt === 'number' && Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      storage.delete(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearEntryDraft(key: string): void {
  try {
    storage.delete(key);
  } catch {
    /* ignore */
  }
}
