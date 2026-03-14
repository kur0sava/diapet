import { useEffect } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage } from './useHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { injectionRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { differenceInHours } from 'date-fns';

const MISSED_CHECK_DATE_KEY = 'hintsMissedCheckDate';

export function useMissedInjection() {
  const { showHint } = useHintStore();
  const activePet = usePetStore(s => s.activePet);

  useEffect(() => {
    if (!activePet) return;

    const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
    if (!regDate) return;

    const stage = getStage(regDate);
    if (!stage) return;

    // Don't check more than once per day
    const today = new Date().toISOString().slice(0, 10);
    const lastMissedCheck = storage.getString(MISSED_CHECK_DATE_KEY);
    if (lastMissedCheck === today) return;

    const timer = setTimeout(async () => {
      try {
        const lastInjection = await injectionRepository.findLatest(activePet.id);
        if (!lastInjection) {
          // No injections at all — could be new user, don't nag
          return;
        }

        const hoursSince = differenceInHours(new Date(), new Date(lastInjection.administeredAt));

        if (hoursSince > 14) {
          storage.set(MISSED_CHECK_DATE_KEY, today);

          if (useHintStore.getState().currentHint) return;

          const hint = selectHint('missed_injection', stage, 'any');
          if (hint) showHint(hint);
        }
      } catch {
        // Silently fail — hints are non-critical
      }
    }, 5000); // Delay 5s to let morning greeting go first

    return () => clearTimeout(timer);
  }, [activePet]); // eslint-disable-line react-hooks/exhaustive-deps
}
