/**
 * Event-hint engine (v2.6 batch 3.4) — selection, rotation and throttling
 * for the post-30-day event-driven hint system (data/eventHints.ts).
 */
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { storage, StorageKeys, foodsSeenKey } from '@storage/mmkv/storage';
import { EVENT_HINTS, ONE_SHOT_TRIGGERS, type EventHintTrigger } from '../data/eventHints';
import type { HintCategory } from '../data/hintsContent';
import type { PetSpecies } from '@storage/domain/types';

const MAX_FOODS_SEEN = 100;

function readShown(): string[] {
  try {
    const raw = storage.getString(StorageKeys.EVENT_HINTS_SHOWN_IDS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function persistShown(ids: string[]): void {
  storage.set(StorageKeys.EVENT_HINTS_SHOWN_IDS, JSON.stringify(ids));
}

/**
 * Pick the next unshown hint for an event, respecting species and a
 * once-per-day-per-event throttle. Cyclic events reset their rotation when
 * exhausted; milestones are strictly one-shot.
 * Marks the returned hint as shown — call only when it will be displayed.
 */
export function selectEventHint(
  trigger: EventHintTrigger,
  species?: PetSpecies
): { text: string; category: HintCategory; id: string } | null {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dateKey = `eventHintDate_${trigger}`;
  if (storage.getString(dateKey) === today) return null;

  const sp = species ?? 'cat';
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ru';
  const matches = EVENT_HINTS.filter(
    h => h.trigger === trigger && (!h.species || h.species === 'all' || h.species === sp)
  );
  if (matches.length === 0) return null;

  const shown = readShown();
  let candidates = matches.filter(h => !shown.includes(h.id));
  if (candidates.length === 0) {
    if (ONE_SHOT_TRIGGERS.includes(trigger)) return null;
    // Rotation exhausted — clear only this trigger's ids and start over
    const ids = new Set(matches.map(m => m.id));
    persistShown(shown.filter(id => !ids.has(id)));
    candidates = matches;
  }

  const pick = candidates[0];
  persistShown([...readShown().filter(id => id !== pick.id), pick.id]);
  storage.set(dateKey, today);
  return { text: pick[lang], category: pick.category, id: pick.id };
}

/**
 * Track foods this pet has been fed (by "brand · product" key). Returns true
 * when the food is genuinely NEW for a pet that already has a food history —
 * the very first recorded food seeds the set silently, so existing users
 * don't get a false "new food!" on their staple diet right after the update.
 */
export function registerFoodAndDetectNew(petId: string, foodKey: string): boolean {
  const key = foodsSeenKey(petId);
  let seen: string[] = [];
  try {
    const raw = storage.getString(key);
    const parsed = raw ? JSON.parse(raw) : [];
    seen = Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    seen = [];
  }
  if (seen.includes(foodKey)) return false;
  const wasEmpty = seen.length === 0;
  seen.push(foodKey);
  if (seen.length > MAX_FOODS_SEEN) seen = seen.slice(-MAX_FOODS_SEEN);
  storage.set(key, JSON.stringify(seen));
  return !wasEmpty;
}
