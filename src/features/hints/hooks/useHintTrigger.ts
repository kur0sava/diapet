import { useCallback } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getTimeOfDay, addShownId } from './useHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import type { HintTrigger } from '../data/hintsContent';
import { usePetStore } from '@shared/stores/petStore';

export function useHintTrigger() {
  const { showHint, triggerAchievement } = useHintStore();
  const activePet = usePetStore(s => s.activePet);

  const triggerAfterAction = useCallback(
    (trigger: HintTrigger) => {
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

      // Track injection count for achievement
      if (trigger === 'injection') {
        const count = storage.getNumber(StorageKeys.HINTS_INJECTION_COUNT) ?? 0;
        const newCount = count + 1;
        storage.set(StorageKeys.HINTS_INJECTION_COUNT, newCount);

        // Check achievement: 30 injections logged
        if (newCount >= 30 && !storage.getBoolean(StorageKeys.HINTS_ACHIEVEMENT_SHOWN)) {
          // Delay achievement to not overlap with hint. Mark it shown only when
          // it actually fires — if the app is killed within these 12s, the flag
          // stays unset so the achievement isn't permanently consumed unseen.
          setTimeout(() => {
            if (storage.getBoolean(StorageKeys.HINTS_ACHIEVEMENT_SHOWN)) return;
            storage.set(StorageKeys.HINTS_ACHIEVEMENT_SHOWN, true);
            triggerAchievement();
          }, 12000);
        }
      }
    },
    [showHint, triggerAchievement, activePet?.species]
  );

  return { triggerAfterAction };
}
