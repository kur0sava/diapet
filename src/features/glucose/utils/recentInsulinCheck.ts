import { differenceInMinutes } from 'date-fns';
import { injectionRepository, glucoseRepository } from '@storage/database';

/** Double-dose safety window: warn if another insulin dose exists within this
 *  many minutes of the one being logged. */
export const RECENT_INSULIN_WINDOW_MINUTES = 360; // 6 hours

export interface RecentInsulinHit {
  minutesSince: number;
  hours: number;
  minutes: number;
}

/**
 * Duplicate-injection safety. Finds the nearest prior insulin dose to `at` —
 * checking BOTH the injections table AND inline doses recorded on glucose
 * readings — and returns how long ago it was if it falls inside the warning
 * window. Returns null if none is close enough, or on any DB error (a failed
 * safety query must not block the user from saving).
 *
 * `excludeGlucoseId` skips one glucose reading so that editing a reading which
 * already carries an inline dose does not match itself.
 */
export async function findRecentInsulinDose(
  petId: string,
  at: Date,
  excludeGlucoseId?: string
): Promise<RecentInsulinHit | null> {
  try {
    const iso = at.toISOString();
    const [lastInj, lastInline] = await Promise.all([
      injectionRepository.findNearestTo(petId, iso),
      glucoseRepository.findNearestInsulinTo(petId, iso),
    ]);
    const nearestTimes: string[] = [];
    if (lastInj?.administeredAt) nearestTimes.push(lastInj.administeredAt);
    if (lastInline?.recordedAt && lastInline.id !== excludeGlucoseId) {
      nearestTimes.push(lastInline.recordedAt);
    }
    if (nearestTimes.length === 0) return null;
    const minutesSince = Math.min(
      ...nearestTimes.map(ts => Math.abs(differenceInMinutes(at, new Date(ts))))
    );
    if (minutesSince >= RECENT_INSULIN_WINDOW_MINUTES) return null;
    return {
      minutesSince,
      hours: Math.floor(minutesSince / 60),
      minutes: minutesSince % 60,
    };
  } catch {
    // A failed safety query must never block a legitimate save.
    return null;
  }
}
