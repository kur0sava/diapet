import { differenceInDays, parseISO } from 'date-fns';
import i18n from '@shared/i18n';
import {
  HINTS,
  HintTrigger,
  HintStage,
  HintTimeOfDay,
  HintCategory,
  HintContent,
  HintSpecies,
} from '../data/hintsContent';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import type { PetSpecies } from '@storage/domain/types';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

export function getStage(registrationDate: string): HintStage | null {
  const daysSince = differenceInDays(new Date(), parseISO(registrationDate));
  if (daysSince < 0) return null;
  if (daysSince < 7) return 'week1';
  if (daysSince < 14) return 'week2';
  if (daysSince < 21) return 'week3';
  if (daysSince < 28) return 'week4';
  if (daysSince < 30) return 'days29_30';
  return null; // free-hint period is over
}

export function getDayNumber(registrationDate: string): number {
  return differenceInDays(new Date(), parseISO(registrationDate)) + 1;
}

export function getTimeOfDay(): HintTimeOfDay {
  const hour = new Date().getHours();
  return hour < 14 ? 'morning' : 'evening';
}

// ---------------------------------------------------------------------------
// MMKV-backed shown-IDs list
// ---------------------------------------------------------------------------

function getShownIds(): string[] {
  const raw = storage.getString(StorageKeys.HINTS_SHOWN_IDS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addShownId(id: string): void {
  const shown = getShownIds();
  shown.push(id);
  storage.set(StorageKeys.HINTS_SHOWN_IDS, JSON.stringify(shown));
}

// ---------------------------------------------------------------------------
// Category balancing
// ---------------------------------------------------------------------------

function countByCategory(
  shownIds: string[],
  allHints: HintContent[]
): Record<HintCategory, number> {
  const counts: Record<HintCategory, number> = {
    practical: 0,
    medical_fact: 0,
    support: 0,
  };
  for (const id of shownIds) {
    const hint = allHints.find(h => h.id === id);
    if (hint) counts[hint.category]++;
  }
  return counts;
}

function pickCategory(counts: Record<HintCategory, number>): HintCategory {
  // Target ratio: practical 40 %, medical_fact 30 %, support 30 %
  const total = counts.practical + counts.medical_fact + counts.support || 1;
  const ratios: Record<HintCategory, number> = {
    practical: counts.practical / total,
    medical_fact: counts.medical_fact / total,
    support: counts.support / total,
  };
  const targets: Record<HintCategory, number> = {
    practical: 0.4,
    medical_fact: 0.3,
    support: 0.3,
  };

  let best: HintCategory = 'practical';
  let bestDiff = -Infinity;
  for (const cat of ['practical', 'medical_fact', 'support'] as HintCategory[]) {
    const diff = targets[cat] - ratios[cat];
    if (diff > bestDiff) {
      bestDiff = diff;
      best = cat;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Core selector
// ---------------------------------------------------------------------------

export function selectHint(
  trigger: HintTrigger,
  stage: HintStage,
  timeOfDay: HintTimeOfDay,
  species?: PetSpecies
): { text: string; category: HintCategory; id: string } | null {
  const shownIds = getShownIds();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'ru';
  const sp = species ?? 'cat';

  const candidates = HINTS.filter(
    h =>
      h.trigger === trigger &&
      h.stage === stage &&
      (h.timeOfDay === timeOfDay || h.timeOfDay === 'any') &&
      (!h.species || h.species === 'all' || h.species === sp) &&
      !shownIds.includes(h.id)
  );

  if (candidates.length === 0) return null;

  const targetCategory = pickCategory(countByCategory(shownIds, HINTS));
  const preferred = candidates.filter(c => c.category === targetCategory);
  const pick = preferred.length > 0 ? preferred[0] : candidates[0];

  return { text: pick[lang], category: pick.category, id: pick.id };
}

// ---------------------------------------------------------------------------
// Hook facade (kept lightweight — logic above is used by other hooks directly)
// ---------------------------------------------------------------------------

export function useHintEngine() {
  return { selectHint, getStage, getDayNumber, getTimeOfDay };
}
