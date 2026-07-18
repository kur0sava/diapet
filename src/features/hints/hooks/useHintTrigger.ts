import { useCallback } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getTimeOfDay, addShownId } from './useHintEngine';
import { checkAchievements } from '../utils/achievementEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import type { HintTrigger } from '../data/hintsContent';
import { usePetStore } from '@shared/stores/petStore';

export function useHintTrigger() {
  const { showHint } = useHintStore();
  const activePet = usePetStore(s => s.activePet);
  const activePetId = activePet?.id;

  const triggerAfterAction = useCallback(
    (trigger: HintTrigger) => {
      // v2.6: achievements are evaluated on every log action (DB counts +
      // streak, see achievementEngine). Slight delay so the modal doesn't
      // pop in the same frame as navigation/toast; NOT gated on
      // HINTS_DISABLED — that toggle is about tips, not milestones.
      setTimeout(() => {
        void checkAchievements(activePetId);
      }, 3000);

      // Respect user's preference to disable hints
      if (storage.getBoolean(StorageKeys.HINTS_DISABLED)) return;

      const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
      if (!regDate) return;

      const stage = getStage(regDate);
      if (!stage) return; // past 30 days — no free hints

      const timeOfDay = getTimeOfDay();
      const hint = selectHint(trigger, stage, timeOfDay, activePet?.species);
      if (hint) {
        addShownId(hint.id);
        showHint(hint);
      }
    },
    [showHint, activePet?.species, activePetId]
  );

  return { triggerAfterAction };
}
