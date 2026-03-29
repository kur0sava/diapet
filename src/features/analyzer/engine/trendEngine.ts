/**
 * Trend Engine — local glucose trend analysis.
 * All calculations are offline, no API calls.
 */
import { GlucoseReading } from '@storage/domain/types';

/** Target glucose range for cats (mmol/L) */
const TARGET_LOW = 4;
const TARGET_HIGH = 12;
/** Morning window: readings recorded between 05:00-09:00 */
const MORNING_HOUR_START = 5;
const MORNING_HOUR_END = 9;

export type TrendDirection = 'improving' | 'stable' | 'worsening';
export type TrendAcceleration = 'accelerating' | 'decelerating' | 'steady';

export interface TrendResult {
  /** Moving averages for different periods (mmol/L) */
  movingAverage3d: number | null;
  movingAverage7d: number | null;
  movingAverage14d: number | null;
  movingAverage30d: number | null;
  /** First derivative — direction of change */
  direction: TrendDirection | null;
  /** Second derivative — is the trend speeding up or slowing down */
  acceleration: TrendAcceleration | null;
  /** Coefficient of variation — glycemic variability (%) */
  cv: number | null;
  /** Percentage of readings within target range (4-12 mmol/L) */
  timeInRange: number | null;
  /** Morning glucose trend (remission indicator) */
  morningTrend: TrendDirection | null;
  morningAverage: number | null;
  /** Data sufficiency */
  totalReadings: number;
  periodDays: number;
}

/**
 * Filter readings to a time window.
 */
function filterByDays(readings: GlucoseReading[], days: number, now: Date): GlucoseReading[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return readings.filter(r => new Date(r.recordedAt).getTime() >= cutoff);
}

/**
 * Calculate arithmetic mean of mmol values.
 */
function mean(readings: GlucoseReading[]): number | null {
  if (readings.length === 0) return null;
  return readings.reduce((sum, r) => sum + r.valueMmol, 0) / readings.length;
}

/**
 * Standard deviation of mmol values.
 */
function stdDev(readings: GlucoseReading[]): number | null {
  if (readings.length < 2) return null;
  const avg = mean(readings)!;
  const variance = readings.reduce((sum, r) => sum + (r.valueMmol - avg) ** 2, 0) / (readings.length - 1);
  return Math.sqrt(variance);
}

/**
 * C1: Moving average for a given period.
 */
function movingAverage(readings: GlucoseReading[], days: number, now: Date): number | null {
  const filtered = filterByDays(readings, days, now);
  return mean(filtered);
}

/**
 * C2: Trend direction via linear regression slope on daily averages.
 * Compares 7-day average vs 14-day average as a simpler heuristic.
 */
function calculateDirection(readings: GlucoseReading[], now: Date): TrendDirection | null {
  const recent7 = filterByDays(readings, 7, now);
  const older7to14 = readings.filter(r => {
    const t = new Date(r.recordedAt).getTime();
    const cutoff7 = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const cutoff14 = now.getTime() - 14 * 24 * 60 * 60 * 1000;
    return t >= cutoff14 && t < cutoff7;
  });

  const avgRecent = mean(recent7);
  const avgOlder = mean(older7to14);

  if (avgRecent === null || avgOlder === null) return null;

  const diff = avgRecent - avgOlder;
  const threshold = avgOlder * 0.10; // 10% change is significant

  if (diff < -threshold) return 'improving'; // glucose going down
  if (diff > threshold) return 'worsening';  // glucose going up
  return 'stable';
}

/**
 * C3: Trend acceleration — compare recent slope vs older slope.
 * Uses 3 periods: 0-5d, 5-10d, 10-15d.
 */
function calculateAcceleration(readings: GlucoseReading[], now: Date): TrendAcceleration | null {
  const period = 5;
  const periods = [0, 1, 2].map(i => {
    const start = now.getTime() - (i + 1) * period * 24 * 60 * 60 * 1000;
    const end = now.getTime() - i * period * 24 * 60 * 60 * 1000;
    const filtered = readings.filter(r => {
      const t = new Date(r.recordedAt).getTime();
      return t >= start && t < end;
    });
    return mean(filtered);
  });

  if (periods.some(p => p === null)) return null;
  const [p0, p1, p2] = periods as number[];

  const slope1 = p0 - p1; // recent slope
  const slope2 = p1 - p2; // older slope

  // If both slopes go same direction and recent is steeper
  if (Math.abs(slope1) > Math.abs(slope2) + 0.3) return 'accelerating';
  if (Math.abs(slope1) < Math.abs(slope2) - 0.3) return 'decelerating';
  return 'steady';
}

/**
 * C4: Glycemic variability — coefficient of variation (%).
 * CV < 25% = stable, 25-36% = moderate, >36% = unstable.
 */
function calculateCV(readings: GlucoseReading[], days: number, now: Date): number | null {
  const filtered = filterByDays(readings, days, now);
  if (filtered.length < 3) return null;
  const avg = mean(filtered)!;
  if (avg === 0) return null;
  const sd = stdDev(filtered)!;
  return (sd / avg) * 100;
}

/**
 * C5: Time-in-range — % of readings within 4-12 mmol/L.
 */
function calculateTimeInRange(readings: GlucoseReading[], days: number, now: Date): number | null {
  const filtered = filterByDays(readings, days, now);
  if (filtered.length === 0) return null;
  const inRange = filtered.filter(r => r.valueMmol >= TARGET_LOW && r.valueMmol <= TARGET_HIGH);
  return (inRange.length / filtered.length) * 100;
}

/**
 * C6: Morning glucose trend — separate trend for morning readings.
 * Consistently low morning glucose is a remission indicator.
 */
function calculateMorningTrend(readings: GlucoseReading[], now: Date): { direction: TrendDirection | null; average: number | null } {
  const morningReadings = readings.filter(r => {
    const hour = new Date(r.recordedAt).getHours();
    return hour >= MORNING_HOUR_START && hour <= MORNING_HOUR_END;
  });

  if (morningReadings.length < 3) return { direction: null, average: null };

  const avg = mean(morningReadings);

  // Compare recent 7d mornings vs older 7-14d mornings
  const recent = morningReadings.filter(r =>
    new Date(r.recordedAt).getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000
  );
  const older = morningReadings.filter(r => {
    const t = new Date(r.recordedAt).getTime();
    return t >= now.getTime() - 14 * 24 * 60 * 60 * 1000 &&
           t < now.getTime() - 7 * 24 * 60 * 60 * 1000;
  });

  const avgRecent = mean(recent);
  const avgOlder = mean(older);

  if (avgRecent === null || avgOlder === null) return { direction: null, average: avg };

  const diff = avgRecent - avgOlder;
  const threshold = avgOlder * 0.10;

  let direction: TrendDirection | null;
  if (diff < -threshold) direction = 'improving';
  else if (diff > threshold) direction = 'worsening';
  else direction = 'stable';

  return { direction, average: avgRecent };
}

/**
 * Main entry point — analyze all glucose readings for a pet.
 * Expects readings sorted by recordedAt ASC.
 */
export function analyzeTrends(readings: GlucoseReading[], now = new Date()): TrendResult {
  const periodDays = readings.length > 0
    ? Math.ceil((now.getTime() - new Date(readings[0].recordedAt).getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  const morning = calculateMorningTrend(readings, now);

  return {
    movingAverage3d: movingAverage(readings, 3, now),
    movingAverage7d: movingAverage(readings, 7, now),
    movingAverage14d: movingAverage(readings, 14, now),
    movingAverage30d: movingAverage(readings, 30, now),
    direction: calculateDirection(readings, now),
    acceleration: calculateAcceleration(readings, now),
    cv: calculateCV(readings, 14, now),
    timeInRange: calculateTimeInRange(readings, 14, now),
    morningTrend: morning.direction,
    morningAverage: morning.average,
    totalReadings: readings.length,
    periodDays,
  };
}
