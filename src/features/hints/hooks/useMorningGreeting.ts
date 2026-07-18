import { useEffect } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, getDayNumber, addShownId } from './useHintEngine';
import { checkAchievements } from '../utils/achievementEngine';
import { selectEventHint } from '../utils/eventHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { differenceInDays, format, parseISO } from 'date-fns';
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

    // How long the diary sat untouched before this open (for the
    // welcome-back hint). Computed BEFORE the write above overwrote lastOpen.
    let gapDays = 0;
    if (lastOpen) {
      try {
        gapDays = differenceInDays(new Date(), parseISO(lastOpen));
      } catch {
        gapDays = 0;
      }
    }

    // Delay morning greeting to not interfere with app loading
    const timer = setTimeout(() => {
      // v2.6: once-a-day achievements pass (catches day-30 hero and streak
      // milestones reached overnight). Pets are loaded by timer-fire time.
      void checkAchievements(usePetStore.getState().activePet?.id);

      if (useHintStore.getState().currentHint) return; // Something else shown
      const species = usePetStore.getState().activePet?.species;

      // v2.6 (3.4): event hints outrank the generic morning greeting.
      // Welcome-back after a 4+ day silence; then one-shot day-90/180
      // milestones (windowed so a long-time user doesn't get "3 months!"
      // at day 300).
      const dayNum = getDayNumber(regDate);
      const eventHint =
        (gapDays >= 4 ? selectEventHint('return_after_gap', species) : null) ??
        (dayNum >= 180
          ? selectEventHint('milestone_180', species)
          : dayNum >= 90
            ? selectEventHint('milestone_90', species)
            : null);
      if (eventHint) {
        useHintStore.getState().showHint(eventHint);
        return;
      }

      const stage = getStage(regDate);
      if (!stage) return; // Past 30 days — no free morning hints

      const hint = selectHint('morning', stage, 'any', species);
      if (hint) {
        addShownId(hint.id);
        useHintStore.getState().showHint(hint);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
}
