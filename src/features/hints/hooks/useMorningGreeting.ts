import { useEffect } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, addShownId } from './useHintEngine';
import { checkAchievements } from '../utils/achievementEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { format } from 'date-fns';
import { usePetStore } from '@shared/stores/petStore';

export function useMorningGreeting() {
  // Mount-only effect. Previously this depended on the active pet's species:
  // the first run (species still undefined while loadPets() is in flight)
  // stamped HINTS_LAST_APP_OPEN_DATE = today and armed a 2s timer; when
  // loadPets resolved ~ms later the species change re-ran the effect, the
  // cleanup killed the timer, and the re-run bailed on `lastOpen === today`.
  // Net effect: the morning greeting never fired. Species is now read from
  // the store at timer-fire time, when pets are guaranteed loaded.
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

    // Delay morning greeting to not interfere with app loading
    const timer = setTimeout(() => {
      // v2.6: once-a-day achievements pass (catches day-30 hero and streak
      // milestones reached overnight). Pets are loaded by timer-fire time.
      void checkAchievements(usePetStore.getState().activePet?.id);

      const stage = getStage(regDate);
      if (!stage) return; // Past 30 days — no free morning hints

      if (useHintStore.getState().currentHint) return; // Something else shown
      const species = usePetStore.getState().activePet?.species;
      const hint = selectHint('morning', stage, 'any', species);
      if (hint) {
        addShownId(hint.id);
        useHintStore.getState().showHint(hint);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
}
