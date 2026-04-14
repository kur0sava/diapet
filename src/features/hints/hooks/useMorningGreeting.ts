import { useEffect } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getDayNumber, addShownId } from './useHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { format } from 'date-fns';
import { usePetStore } from '@shared/stores/petStore';

export function useMorningGreeting() {
  const species = usePetStore(s => s.activePet?.species);
  useEffect(() => {
    if (storage.getBoolean(StorageKeys.HINTS_DISABLED)) return;

    const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
    if (!regDate) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const lastOpen = storage.getString(StorageKeys.HINTS_LAST_APP_OPEN_DATE);

    // Update last open date
    storage.set(StorageKeys.HINTS_LAST_APP_OPEN_DATE, today);

    // Already opened today — skip
    if (lastOpen === today) return;

    // Check achievement: day 30
    const dayNum = getDayNumber(regDate);
    if (dayNum >= 30 && !storage.getBoolean(StorageKeys.HINTS_ACHIEVEMENT_SHOWN)) {
      storage.set(StorageKeys.HINTS_ACHIEVEMENT_SHOWN, true);
      useHintStore.getState().triggerAchievement();
      return; // Don't show greeting alongside achievement
    }

    const stage = getStage(regDate);
    if (!stage) return; // Past 30 days

    // Delay morning greeting to not interfere with app loading
    const timer = setTimeout(() => {
      if (useHintStore.getState().currentHint) return; // Something else shown
      const hint = selectHint('morning', stage, 'any', species);
      if (hint) {
        addShownId(hint.id);
        useHintStore.getState().showHint(hint);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [species]); // eslint-disable-line react-hooks/exhaustive-deps
}
