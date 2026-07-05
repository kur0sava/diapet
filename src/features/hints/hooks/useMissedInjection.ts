import { useEffect } from 'react';
import { useHintStore } from '../store/hintStore';
import { selectHint, getStage, addShownId } from './useHintEngine';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { injectionRepository, glucoseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { differenceInHours } from 'date-fns';
import { todayLocal } from '@shared/utils/dateUtils';

const MISSED_CHECK_DATE_KEY = 'hintsMissedCheckDate';

export function useMissedInjection() {
  const activePet = usePetStore(s => s.activePet);

  useEffect(() => {
    if (!activePet) return;
    if (storage.getBoolean(StorageKeys.HINTS_DISABLED)) return;

    const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
    if (!regDate) return;

    const stage = getStage(regDate);
    if (!stage) return;

    // Don't check more than once per day
    const today = todayLocal();
    const lastMissedCheck = storage.getString(MISSED_CHECK_DATE_KEY);
    if (lastMissedCheck === today) return;

    const timer = setTimeout(async () => {
      try {
        // Consider both dedicated injection logs and inline insulin doses
        // recorded on glucose readings — a user who logs doses via the
        // glucose screen would otherwise be nagged about "missed" injections.
        const [lastInjection, lastInline] = await Promise.all([
          injectionRepository.findLatest(activePet.id),
          glucoseRepository.findLatestWithInsulin(activePet.id),
        ]);
        const lastTimes = [lastInjection?.administeredAt, lastInline?.recordedAt].filter(
          (v): v is string => !!v
        );
        if (lastTimes.length === 0) {
          // No injections at all — could be new user, don't nag
          return;
        }

        const mostRecent = lastTimes.sort().pop() as string;
        const hoursSince = differenceInHours(new Date(), new Date(mostRecent));

        if (hoursSince > 14) {
          storage.set(MISSED_CHECK_DATE_KEY, today);

          const hint = selectHint('missed_injection', stage, 'any', activePet.species);
          if (hint) {
            addShownId(hint.id);
            useHintStore.getState().showHint(hint);
          }
        }
      } catch {
        // Silently fail — hints are non-critical
      }
    }, 5000); // Delay 5s to let morning greeting go first

    return () => clearTimeout(timer);
  }, [activePet]); // eslint-disable-line react-hooks/exhaustive-deps
}
