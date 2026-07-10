import { storage } from '@storage/mmkv/storage';

/**
 * Persist/restore an in-progress log entry (audit C2). The daily logging
 * screens kept everything in React state only, so an OS kill / incoming call
 * mid-entry lost the reading. Drafts are per-pet, only for NEW entries, expire
 * after a day, and are cleared on a successful save.
 *
 * The storage key is namespaced by petId (audit M1). A single shared key made
 * the mount-time persist effect of pet B — which starts with an empty form —
 * clear pet A's still-unsaved draft. Per-pet keys keep each pet's draft
 * isolated; the petId is also kept inside the value as a defensive check.
 */
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function draftKey(base: string, petId: string): string {
  return `${base}_${petId}`;
}

export function saveEntryDraft(base: string, petId: string, data: Record<string, unknown>): void {
  try {
    storage.set(draftKey(base, petId), JSON.stringify({ petId, savedAt: Date.now(), ...data }));
  } catch {
    /* draft persistence is best-effort */
  }
}

export function loadEntryDraft<T extends Record<string, unknown>>(
  base: string,
  petId: string
): T | null {
  try {
    const key = draftKey(base, petId);
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

export function clearEntryDraft(base: string, petId: string): void {
  try {
    storage.delete(draftKey(base, petId));
  } catch {
    /* ignore */
  }
}
