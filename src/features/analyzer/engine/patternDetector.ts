/**
 * Pattern Detector — identifies clinical patterns in glucose/injection/feeding data.
 * All calculations are offline, no API calls.
 */
import { GlucoseReading, InjectionLog, FeedingLog } from '@storage/domain/types';
import type { SpeciesConfig } from '@shared/config/speciesConfig';

export type PatternType =
  | 'somogyi'
  | 'dawn_phenomenon'
  | 'post_meal_spike'
  | 'missed_injection_impact'
  | 'food_correlation'
  | 'dose_response'
  | 'remission_candidate';

export interface DetectedPattern {
  type: PatternType;
  confidence: 'low' | 'medium' | 'high';
  description: string;
  /** Data points that triggered this detection */
  evidence: string[];
  detectedAt: string;
}

interface PatternInput {
  readings: GlucoseReading[];
  injections: InjectionLog[];
  feedings: FeedingLog[];
  now?: Date;
  config?: SpeciesConfig;
}

function hoursApart(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (60 * 60 * 1000);
}

function hourOfDay(iso: string): number {
  return new Date(iso).getHours();
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * M004: readings sorted by time with the epoch cached. The event→reading
 * detectors below used to nest full scans (O(feedings×readings)) and parse
 * two dates per pair — after months of data that's hundreds of thousands of
 * Date allocations on every analyzer focus. One sort + binary search brings
 * it to O((events + readings)·log readings).
 */
interface TimedReading {
  reading: GlucoseReading;
  t: number;
}

function buildTimeline(readings: GlucoseReading[]): TimedReading[] {
  return readings
    .map(r => ({ reading: r, t: new Date(r.recordedAt).getTime() }))
    .sort((a, b) => a.t - b.t);
}

/** Readings with recordedAt in the inclusive window [startMs, endMs]. */
function readingsInWindow(
  timeline: TimedReading[],
  startMs: number,
  endMs: number
): GlucoseReading[] {
  let lo = 0;
  let hi = timeline.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].t < startMs) lo = mid + 1;
    else hi = mid;
  }
  const out: GlucoseReading[] = [];
  for (let i = lo; i < timeline.length && timeline[i].t <= endMs; i++) {
    out.push(timeline[i].reading);
  }
  return out;
}

/** Average valueMmol of readings in the window, or null if none. */
function avgInWindow(timeline: TimedReading[], startMs: number, endMs: number): number | null {
  const inWindow = readingsInWindow(timeline, startMs, endMs);
  if (inWindow.length === 0) return null;
  return inWindow.reduce((s, r) => s + r.valueMmol, 0) / inWindow.length;
}

/**
 * C7: Somogyi effect — low nadir followed by rebound spike.
 * Thresholds: nadir < somogyiNadirThreshold, rebound > somogyiReboundThreshold.
 */
function detectSomogyi(timeline: TimedReading[], config?: SpeciesConfig): DetectedPattern | null {
  const nadirThreshold = config?.analyzer.somogyiNadirThreshold ?? 4;
  const reboundThreshold = config?.analyzer.somogyiReboundThreshold ?? 18;

  for (let i = 0; i < timeline.length - 1; i++) {
    if (timeline[i].reading.valueMmol >= nadirThreshold) continue; // Need low nadir
    for (let j = i + 1; j < timeline.length; j++) {
      const gap = (timeline[j].t - timeline[i].t) / HOUR_MS;
      if (gap > 12) break;
      if (timeline[j].reading.valueMmol >= reboundThreshold) {
        return {
          type: 'somogyi',
          confidence: 'medium',
          description: `Low ${timeline[i].reading.valueMmol.toFixed(1)} mmol/L → rebound ${timeline[j].reading.valueMmol.toFixed(1)} mmol/L within ${Math.round(gap)}h`,
          evidence: [timeline[i].reading.id, timeline[j].reading.id],
          detectedAt: new Date().toISOString(),
        };
      }
    }
  }
  return null;
}

/**
 * C8: Dawn phenomenon — morning readings (5-9am) consistently higher than daytime (10am-6pm).
 */
function detectDawnPhenomenon(readings: GlucoseReading[]): DetectedPattern | null {
  const morning = readings.filter(r => {
    const h = hourOfDay(r.recordedAt);
    return h >= 5 && h <= 9;
  });
  const daytime = readings.filter(r => {
    const h = hourOfDay(r.recordedAt);
    return h >= 10 && h <= 18;
  });

  if (morning.length < 3 || daytime.length < 3) return null;

  const avgMorning = morning.reduce((s, r) => s + r.valueMmol, 0) / morning.length;
  const avgDaytime = daytime.reduce((s, r) => s + r.valueMmol, 0) / daytime.length;

  if (avgMorning > avgDaytime * 1.2) {
    return {
      type: 'dawn_phenomenon',
      confidence: avgMorning > avgDaytime * 1.35 ? 'high' : 'medium',
      description: `Morning avg ${avgMorning.toFixed(1)} vs daytime avg ${avgDaytime.toFixed(1)} mmol/L (+${((avgMorning / avgDaytime - 1) * 100).toFixed(0)}%)`,
      evidence: morning.slice(-3).map(r => r.id),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C9: Post-meal spike — feeding followed by glucose above postMealSpikeThreshold within 2-4 hours.
 */
function detectPostMealSpike(
  timeline: TimedReading[],
  feedings: FeedingLog[],
  config?: SpeciesConfig
): DetectedPattern | null {
  const spikeThreshold = config?.analyzer.postMealSpikeThreshold ?? 15;
  const spikes: { feedingId: string; readingId: string; value: number }[] = [];

  for (const feeding of feedings) {
    const fedMs = new Date(feeding.fedAt).getTime();
    for (const reading of readingsInWindow(timeline, fedMs + 2 * HOUR_MS, fedMs + 4 * HOUR_MS)) {
      if (reading.valueMmol > spikeThreshold) {
        spikes.push({
          feedingId: feeding.id,
          readingId: reading.id,
          value: reading.valueMmol,
        });
      }
    }
  }

  if (spikes.length >= 2) {
    return {
      type: 'post_meal_spike',
      confidence: spikes.length >= 4 ? 'high' : 'medium',
      description: `${spikes.length} post-meal spikes >${spikeThreshold} mmol/L detected (2-4h after feeding)`,
      evidence: spikes.slice(0, 5).map(s => s.readingId),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C10: Missed/delayed injection impact — gap >14h between injections followed by high glucose.
 */
function detectMissedInjectionImpact(
  readings: GlucoseReading[],
  injections: InjectionLog[],
  config?: SpeciesConfig
): DetectedPattern | null {
  const missedThreshold = config?.analyzer.missedInjectionThreshold ?? 15;
  const sortedInj = [...injections].sort((a, b) =>
    a.administeredAt.localeCompare(b.administeredAt)
  );
  const impacts: string[] = [];

  for (let i = 1; i < sortedInj.length; i++) {
    const gap = hoursApart(sortedInj[i - 1].administeredAt, sortedInj[i].administeredAt);
    if (gap < 14) continue; // Normal gap is ~12h

    // Find glucose readings in the gap period
    const gapReadings = readings.filter(
      r =>
        r.recordedAt > sortedInj[i - 1].administeredAt &&
        r.recordedAt <= sortedInj[i].administeredAt
    );
    const highReadings = gapReadings.filter(r => r.valueMmol > missedThreshold);
    if (highReadings.length > 0) {
      impacts.push(...highReadings.map(r => r.id));
    }
  }

  if (impacts.length >= 2) {
    return {
      type: 'missed_injection_impact',
      confidence: impacts.length >= 4 ? 'high' : 'medium',
      description: `${impacts.length} high glucose readings found after delayed injections (>14h gap)`,
      evidence: impacts.slice(0, 5),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C11: Food type correlation — which food type gives better glucose control.
 */
function detectFoodCorrelation(
  timeline: TimedReading[],
  feedings: FeedingLog[]
): DetectedPattern | null {
  const foodTypeAvg = new Map<string, { total: number; count: number }>();

  for (const feeding of feedings) {
    const foodKey = feeding.foodType ?? 'unknown';
    // Average glucose 2-4h after this feeding
    const fedMs = new Date(feeding.fedAt).getTime();
    const avg = avgInWindow(timeline, fedMs + 2 * HOUR_MS, fedMs + 4 * HOUR_MS);
    if (avg === null) continue;

    const existing = foodTypeAvg.get(foodKey) ?? { total: 0, count: 0 };
    foodTypeAvg.set(foodKey, { total: existing.total + avg, count: existing.count + 1 });
  }

  const entries = [...foodTypeAvg.entries()]
    .filter(([, v]) => v.count >= 3)
    .map(([k, v]) => ({ type: k, avg: v.total / v.count, count: v.count }))
    .sort((a, b) => a.avg - b.avg);

  if (entries.length >= 2) {
    const best = entries[0];
    const worst = entries[entries.length - 1];
    if (worst.avg - best.avg > 2) {
      return {
        type: 'food_correlation',
        confidence: best.count >= 5 && worst.count >= 5 ? 'high' : 'medium',
        description: `${best.type} avg ${best.avg.toFixed(1)} mmol/L (n=${best.count}) vs ${worst.type} avg ${worst.avg.toFixed(1)} mmol/L (n=${worst.count})`,
        evidence: [],
        detectedAt: new Date().toISOString(),
      };
    }
  }
  return null;
}

/**
 * C12: Dose-response analysis — specific dose → glucose 4h later.
 */
function detectDoseResponse(
  timeline: TimedReading[],
  injections: InjectionLog[]
): DetectedPattern | null {
  const doseGroups = new Map<number, number[]>();

  for (const inj of injections) {
    const injMs = new Date(inj.administeredAt).getTime();
    const avgGlucose = avgInWindow(timeline, injMs + 3 * HOUR_MS, injMs + 6 * HOUR_MS);
    if (avgGlucose === null) continue;

    const dose = Math.round(inj.doseUnits * 2) / 2; // Round to 0.5
    const existing = doseGroups.get(dose) ?? [];
    existing.push(avgGlucose);
    doseGroups.set(dose, existing);
  }

  const entries = [...doseGroups.entries()]
    .filter(([, v]) => v.length >= 3)
    .map(([dose, values]) => ({
      dose,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    }))
    .sort((a, b) => a.dose - b.dose);

  if (entries.length >= 2) {
    return {
      type: 'dose_response',
      confidence: entries.every(e => e.count >= 5) ? 'high' : 'low',
      description: entries
        .map(e => `${e.dose}U → avg ${e.avg.toFixed(1)} mmol/L (n=${e.count})`)
        .join('; '),
      evidence: [],
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C13: Remission candidate — morning glucose below threshold for 14+ consecutive days.
 * Skipped if remission is not relevant for this species (e.g. dogs).
 */
function detectRemissionCandidate(
  readings: GlucoseReading[],
  now: Date,
  config?: SpeciesConfig
): DetectedPattern | null {
  if (config && !config.analyzer.remissionRelevant) return null;
  const morningThreshold = config?.analyzer.remissionMorningThreshold ?? 7;
  const morningReadings = readings
    .filter(r => {
      const h = hourOfDay(r.recordedAt);
      return h >= 5 && h <= 9;
    })
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  if (morningReadings.length < 7) return null;

  // Check last 14 days of morning readings
  const cutoff14d = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  const recent = morningReadings.filter(r => new Date(r.recordedAt).getTime() >= cutoff14d);

  if (recent.length < 5) return null;
  const allUnderThreshold = recent.every(r => r.valueMmol < morningThreshold);

  if (allUnderThreshold) {
    const avg = recent.reduce((s, r) => s + r.valueMmol, 0) / recent.length;
    return {
      type: 'remission_candidate',
      confidence: recent.length >= 10 ? 'high' : 'medium',
      description: `${recent.length} morning readings all <${morningThreshold} mmol/L over 14 days (avg ${avg.toFixed(1)})`,
      evidence: recent.slice(-5).map(r => r.id),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * Main entry point — detect all patterns.
 * MED-07: Window inputs to last 60 days to avoid O(n²) on large datasets.
 */
export function detectPatterns(input: PatternInput): DetectedPattern[] {
  const { now = new Date(), config } = input;
  const cutoff = now.getTime() - 60 * 24 * 60 * 60 * 1000;
  const readings = input.readings.filter(r => new Date(r.recordedAt).getTime() >= cutoff);
  const injections = input.injections.filter(r => new Date(r.administeredAt).getTime() >= cutoff);
  const feedings = input.feedings.filter(r => new Date(r.fedAt).getTime() >= cutoff);
  const patterns: DetectedPattern[] = [];
  // M004: one shared sorted timeline for all event→reading detectors
  const timeline = buildTimeline(readings);

  const detectors = [
    () => detectSomogyi(timeline, config),
    () => detectDawnPhenomenon(readings),
    () => detectPostMealSpike(timeline, feedings, config),
    () => detectMissedInjectionImpact(readings, injections, config),
    () => detectFoodCorrelation(timeline, feedings),
    () => detectDoseResponse(timeline, injections),
    () => detectRemissionCandidate(readings, now, config),
  ];

  for (const detect of detectors) {
    const result = detect();
    if (result) patterns.push(result);
  }

  return patterns;
}
