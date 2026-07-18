/**
 * Achievement engine (v2.6 batch 3.3).
 *
 * Evaluates the ACHIEVEMENTS catalog against real DB counts + the logging
 * streak, persists unlocks in MMKV and pushes newly unlocked achievements to
 * the modal queue in hintStore. Called (fire-and-forget) after log actions
 * and once per day from the morning-greeting effect.
 */
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { getDatabase } from '@storage/database';
import { useHintStore } from '../store/hintStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { getDayNumber } from '../hooks/useHintEngine';

function localDayKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readUnlocked(): Set<string> {
  try {
    const raw = storage.getString(StorageKeys.ACHIEVEMENTS_UNLOCKED);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function persistUnlocked(unlocked: Set<string>): void {
  storage.set(StorageKeys.ACHIEVEMENTS_UNLOCKED, JSON.stringify([...unlocked]));
}

/**
 * Days in a row (ending today, or yesterday as grace — the owner shouldn't
 * lose a 20-day streak just because they open the app before the morning
 * measurement) with at least one record of any type for this pet.
 */
export async function computeStreakDays(petId: string, now = new Date()): Promise<number> {
  const db = await getDatabase();
  // 366-day window bounds the query; nobody reads "400 days in a row" off a chip
  const cutoff = new Date(now.getTime() - 366 * 24 * 60 * 60 * 1000).toISOString();
  const rows = await db.getAllAsync<{ ts: string }>(
    `SELECT recorded_at AS ts FROM glucose_readings WHERE pet_id = ? AND recorded_at >= ?
     UNION ALL SELECT administered_at FROM injections WHERE pet_id = ? AND administered_at >= ?
     UNION ALL SELECT fed_at FROM feedings WHERE pet_id = ? AND fed_at >= ?
     UNION ALL SELECT recorded_at FROM symptoms WHERE pet_id = ? AND recorded_at >= ?`,
    [petId, cutoff, petId, cutoff, petId, cutoff, petId, cutoff]
  );
  const days = new Set<string>();
  for (const r of rows) {
    const t = new Date(r.ts);
    if (!isNaN(t.getTime())) days.add(localDayKey(t));
  }

  const cursor = new Date(now);
  if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // yesterday grace
  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Re-entrancy guard: rapid save+hint sequences can fire several checks;
// one at a time is enough — a skipped call is picked up by the next one.
let checking = false;

export async function checkAchievements(petId: string | undefined): Promise<void> {
  if (!petId || checking) return;
  checking = true;
  try {
    const unlocked = readUnlocked();

    // Legacy migration: the pre-v2.6 single "Diabetes Hero" achievement kept
    // its shown-state in HINTS_ACHIEVEMENT_SHOWN. Adopt it silently so the
    // modal doesn't replay for long-time users.
    if (storage.getBoolean(StorageKeys.HINTS_ACHIEVEMENT_SHOWN) && !unlocked.has('hero')) {
      unlocked.add('hero');
      persistUnlocked(unlocked);
    }
    if (unlocked.size >= ACHIEVEMENTS.length) return;

    const db = await getDatabase();
    const count = async (sql: string): Promise<number> => {
      const row = await db.getFirstAsync<{ c: number }>(sql, [petId]);
      return row?.c ?? 0;
    };
    const glucoseCount = await count('SELECT COUNT(*) AS c FROM glucose_readings WHERE pet_id = ?');
    // Inline insulin doses logged on glucose readings ARE injections
    // (same merge rule as the analyzer) — a LogGlucose-only user still
    // reaches the injection achievements.
    const injectionCount =
      (await count('SELECT COUNT(*) AS c FROM injections WHERE pet_id = ?')) +
      (await count(
        'SELECT COUNT(*) AS c FROM glucose_readings WHERE pet_id = ? AND insulin_dose > 0'
      ));
    const feedingCount = await count('SELECT COUNT(*) AS c FROM feedings WHERE pet_id = ?');
    const symptomCount = await count('SELECT COUNT(*) AS c FROM symptoms WHERE pet_id = ?');
    const weightCount = await count('SELECT COUNT(*) AS c FROM weight_entries WHERE pet_id = ?');
    const totalCount = glucoseCount + injectionCount + feedingCount + symptomCount;

    // Streak is only worth computing when a streak achievement is still locked
    const needStreak = ACHIEVEMENTS.some(
      a => a.condition.type === 'streakDays' && !unlocked.has(a.id)
    );
    const streakDays = needStreak ? await computeStreakDays(petId) : 0;

    const regDate = storage.getString(StorageKeys.HINTS_REGISTRATION_DATE);
    const dayNumber = regDate ? getDayNumber(regDate) : 0;

    const met = (a: (typeof ACHIEVEMENTS)[number]): boolean => {
      switch (a.condition.type) {
        case 'glucoseCount':
          return glucoseCount >= a.condition.threshold;
        case 'injectionCount':
          return injectionCount >= a.condition.threshold;
        case 'weightCount':
          return weightCount >= a.condition.threshold;
        case 'totalCount':
          return totalCount >= a.condition.threshold;
        case 'streakDays':
          return streakDays >= a.condition.threshold;
        case 'hero':
          return dayNumber >= 30 || injectionCount >= 30;
      }
    };

    for (const a of ACHIEVEMENTS) {
      if (unlocked.has(a.id) || !met(a)) continue;
      unlocked.add(a.id);
      persistUnlocked(unlocked);
      if (a.id === 'hero') storage.set(StorageKeys.HINTS_ACHIEVEMENT_SHOWN, true);
      useHintStore.getState().showAchievementById(a.id);
    }
  } catch {
    // Achievements are decoration — never let them break a save flow
  } finally {
    checking = false;
  }
}
