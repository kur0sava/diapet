/**
 * Weekly summary (v2.6 batch 3.2) — rolling 7-day stats vs the previous
 * 7 days. Pure and species-aware; used by the dashboard card and the
 * Sunday-evening push.
 */
import type { GlucoseReading } from '@storage/domain/types';
import { getTirBounds, type SpeciesConfig } from '@shared/config/speciesConfig';

export interface WeeklySummary {
  /** Readings in the last 7 days */
  measurements: number;
  /** Time-in-range % for the last 7 days (null when no readings) */
  tir: number | null;
  /** TIR change vs the previous 7 days, percentage points (null when either week lacks data) */
  tirDelta: number | null;
  /** Average glucose (mmol/L) for the last 7 days */
  avgMmol: number | null;
  /** Average change vs the previous 7 days (mmol/L) */
  avgDeltaMmol: number | null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeWeeklySummary(
  readings: GlucoseReading[],
  config?: SpeciesConfig,
  now = new Date()
): WeeklySummary {
  const t0 = now.getTime();
  const current: GlucoseReading[] = [];
  const previous: GlucoseReading[] = [];
  for (const r of readings) {
    const t = new Date(r.recordedAt).getTime();
    if (isNaN(t) || t > t0) continue; // future-dated rows (clock change) are noise
    if (t > t0 - WEEK_MS) current.push(r);
    else if (t > t0 - 2 * WEEK_MS) previous.push(r);
  }

  const { low, high } = getTirBounds(config);
  const tirOf = (arr: GlucoseReading[]): number | null =>
    arr.length > 0
      ? (arr.filter(r => r.valueMmol >= low && r.valueMmol <= high).length / arr.length) * 100
      : null;
  const avgOf = (arr: GlucoseReading[]): number | null =>
    arr.length > 0 ? arr.reduce((s, r) => s + r.valueMmol, 0) / arr.length : null;

  const tir = tirOf(current);
  const prevTir = tirOf(previous);
  const avg = avgOf(current);
  const prevAvg = avgOf(previous);

  return {
    measurements: current.length,
    tir,
    tirDelta: tir !== null && prevTir !== null ? tir - prevTir : null,
    avgMmol: avg,
    avgDeltaMmol: avg !== null && prevAvg !== null ? avg - prevAvg : null,
  };
}
