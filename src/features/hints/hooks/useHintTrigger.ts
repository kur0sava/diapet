import { useCallback } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getTimeOfDay, addShownId } from './useHintEngine';
import { checkAchievements } from '../utils/achievementEngine';
import { selectEventHint, registerFoodAndDetectNew } from '../utils/eventHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import type { HintTrigger } from '../data/hintsContent';
import type { EventHintTrigger } from '../data/eventHints';
import { usePetStore } from '@shared/stores/petStore';

/** Optional context about the action that was just logged — lets the hint
 * system react to WHAT happened, not only that something happened. */
export interface HintActionContext {
  /** Glucose value just logged (mmol/L) */
  valueMmol?: number;
  /** "brand · product" key of the food just fed */
  foodKey?: string;
}

/** How long after an emergency glucose reading we treat the pet as "in crisis"
 *  and suppress hints/achievement modals. Cleared early by any non-emergency
 *  reading. */
const EMERGENCY_WINDOW_MS = 20 * 60 * 1000;

export function useHintTrigger() {
  const { showHint } = useHintStore();
  const activePet = usePetStore(s => s.activePet);
  const activePetId = activePet?.id;
  const species = activePet?.species;

  const triggerAfterAction = useCallback(
    (trigger: HintTrigger, context?: HintActionContext) => {
      const now = Date.now();

      // H1/H2 (UX+logic audit): a glucose reading IN THE EMERGENCY BAND fires the
      // SOS Alert in LogGlucose. Popping a gold achievement modal or a chatty
      // hint on top of a life-threatening crisis is emotionally jarring and
      // buries the alert. The crisis window is a SHORT-LIVED flag so that ANY
      // follow-up action during it (logging feeding/injection/symptom while
      // treating the hypo) is also suppressed — not just the glucose entry.
      if (trigger === 'glucose' && context?.valueMmol != null) {
        const g = getSpeciesConfig(species ?? 'cat').glucose;
        const v = context.valueMmol;
        if (v < g.emergencyLow || v > g.emergencyHigh) {
          // Open/extend the crisis window and suppress everything for this entry.
          storage.set(StorageKeys.EMERGENCY_UNTIL, now + EMERGENCY_WINDOW_MS);
          return;
        }
        // A non-emergency reading means the acute crisis has passed — close the
        // window so normal hints/achievements resume.
        storage.set(StorageKeys.EMERGENCY_UNTIL, 0);
      }

      const inEmergencyWindow = (storage.getNumber(StorageKeys.EMERGENCY_UNTIL) ?? 0) > now;

      // v2.6: achievements are evaluated on every log action (DB counts +
      // streak, see achievementEngine). Slight delay so the modal doesn't
      // pop in the same frame as navigation/toast; NOT gated on
      // HINTS_DISABLED — that toggle is about tips, not milestones. Skipped
      // during a crisis window: checkAchievements is idempotent and re-fires
      // on the next save / next morning, so the milestone isn't lost.
      if (!inEmergencyWindow) {
        setTimeout(() => {
          void checkAchievements(activePetId);
        }, 3000);
      }

      // New-food tracking must run even when hints are disabled — otherwise
      // the seen-set stays stale and the first hint after re-enabling would
      // mislabel a staple food as "new".
      let event: EventHintTrigger | null = null;
      if (trigger === 'feeding' && context?.foodKey && activePetId) {
        if (registerFoodAndDetectNew(activePetId, context.foodKey)) event = 'new_food';
      }

      // H2: no chatty hint on top of an active crisis, regardless of what was
      // just logged (feeding/injection/symptom while treating the hypo).
      if (inEmergencyWindow) return;

      // Respect user's preference to disable hints
      if (storage.getBoolean(StorageKeys.HINTS_DISABLED)) return;

      const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
      if (!regDate) return;

      // v2.6 (3.4): event-driven hints react to the logged VALUE and work at
      // any day number. Mild out-of-range readings get contextual guidance;
      // true emergencies are handled by the SOS alert flow in LogGlucose, so
      // they're excluded here — an alert and a chatty hint would clash.
      if (trigger === 'glucose' && context?.valueMmol != null) {
        const g = getSpeciesConfig(species ?? 'cat').glucose;
        const v = context.valueMmol;
        if (v < g.targetLow && v >= g.emergencyLow) event = 'hypo_logged';
        else if (v >= g.highControlThreshold && v < g.emergencyHigh) event = 'hyper_logged';
      }
      if (event) {
        const eventHint = selectEventHint(event, species);
        if (eventHint) {
          showHint(eventHint);
          return;
        }
      }

      const stage = getStage(regDate);
      if (stage) {
        // First 30 days — the staged onboarding hint track
        const timeOfDay = getTimeOfDay();
        const hint = selectHint(trigger, stage, timeOfDay, species);
        if (hint) {
          addShownId(hint.id);
          showHint(hint);
        }
        return;
      }

      // Past day 30 — generic ongoing tips / encyclopedia teasers, max 1/day
      const ongoing = selectEventHint('ongoing', species);
      if (ongoing) showHint(ongoing);
    },
    [showHint, species, activePetId]
  );

  return { triggerAfterAction };
}
