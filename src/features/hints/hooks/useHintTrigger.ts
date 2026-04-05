import { useCallback } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getTimeOfDay, addShownId } from './useHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import type { HintTrigger } from '../data/hintsContent';

export function useHintTrigger() {
  const { showHint, triggerAchievement } = useHintStore();

  const triggerAfterAction = useCallback(
    (trigger: HintTrigger) => {
      // Respect user's preference to disable hints
      if (storage.getBoolean(StorageKeys.HINTS_DISABLED)) return;

      const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
      if (!regDate) return;

      const stage = getStage(regDate);
      if (!stage) return; // past 30 days — no free hints

      const timeOfDay = getTimeOfDay();
      const hint = selectHint(trigger, stage, timeOfDay);
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
          storage.set(StorageKeys.HINTS_ACHIEVEMENT_SHOWN, true);
          // Delay achievement to not overlap with hint
          setTimeout(() => triggerAchievement(), 12000);
        }
      }
    },
    [showHint, triggerAchievement]
  );

  return { triggerAfterAction };
}
