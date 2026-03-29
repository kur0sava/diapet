/**
 * Pattern Detector — identifies clinical patterns in glucose/injection/feeding data.
 * All calculations are offline, no API calls.
 */
import { GlucoseReading, InjectionLog, FeedingLog } from '@storage/domain/types';

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
}

function hoursApart(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / (60 * 60 * 1000);
}

function hourOfDay(iso: string): number {
  return new Date(iso).getHours();
}

/**
 * C7: Somogyi effect — low nadir followed by rebound spike >18 mmol/L.
 * Look for glucose <4 followed by >18 within 12 hours.
 */
function detectSomogyi(readings: GlucoseReading[]): DetectedPattern | null {
  const sorted = [...readings].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].valueMmol >= 4) continue; // Need low nadir
    for (let j = i + 1; j < sorted.length; j++) {
      const gap = hoursApart(sorted[i].recordedAt, sorted[j].recordedAt);
      if (gap > 12) break;
      if (sorted[j].valueMmol >= 18) {
        return {
          type: 'somogyi',
          confidence: 'medium',
          description: `Low ${sorted[i].valueMmol.toFixed(1)} mmol/L → rebound ${sorted[j].valueMmol.toFixed(1)} mmol/L within ${Math.round(gap)}h`,
          evidence: [sorted[i].id, sorted[j].id],
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

  if (avgMorning > avgDaytime * 1.20) {
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
 * C9: Post-meal spike — feeding followed by glucose >15 mmol/L within 2-4 hours.
 */
function detectPostMealSpike(readings: GlucoseReading[], feedings: FeedingLog[]): DetectedPattern | null {
  const spikes: { feedingId: string; readingId: string; value: number; gap: number }[] = [];

  for (const feeding of feedings) {
    for (const reading of readings) {
      const gap = hoursApart(feeding.fedAt, reading.recordedAt);
      if (gap >= 2 && gap <= 4 && new Date(reading.recordedAt) > new Date(feeding.fedAt)) {
        if (reading.valueMmol > 15) {
          spikes.push({ feedingId: feeding.id, readingId: reading.id, value: reading.valueMmol, gap });
        }
      }
    }
  }

  if (spikes.length >= 2) {
    return {
      type: 'post_meal_spike',
      confidence: spikes.length >= 4 ? 'high' : 'medium',
      description: `${spikes.length} post-meal spikes >15 mmol/L detected (2-4h after feeding)`,
      evidence: spikes.slice(0, 5).map(s => s.readingId),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C10: Missed/delayed injection impact — gap >14h between injections followed by high glucose.
 */
function detectMissedInjectionImpact(readings: GlucoseReading[], injections: InjectionLog[]): DetectedPattern | null {
  const sortedInj = [...injections].sort((a, b) => a.administeredAt.localeCompare(b.administeredAt));
  const impacts: string[] = [];

  for (let i = 1; i < sortedInj.length; i++) {
    const gap = hoursApart(sortedInj[i - 1].administeredAt, sortedInj[i].administeredAt);
    if (gap < 14) continue; // Normal gap is ~12h

    // Find glucose readings in the gap period
    const gapReadings = readings.filter(r =>
      r.recordedAt > sortedInj[i - 1].administeredAt &&
      r.recordedAt <= sortedInj[i].administeredAt
    );
    const highReadings = gapReadings.filter(r => r.valueMmol > 15);
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
function detectFoodCorrelation(readings: GlucoseReading[], feedings: FeedingLog[]): DetectedPattern | null {
  const foodTypeAvg = new Map<string, { total: number; count: number }>();

  for (const feeding of feedings) {
    const foodKey = feeding.foodType ?? 'unknown';
    // Find glucose reading 2-4h after this feeding
    const postReadings = readings.filter(r => {
      const gap = hoursApart(feeding.fedAt, r.recordedAt);
      return gap >= 2 && gap <= 4 && new Date(r.recordedAt) > new Date(feeding.fedAt);
    });
    if (postReadings.length === 0) continue;

    const avg = postReadings.reduce((s, r) => s + r.valueMmol, 0) / postReadings.length;
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
function detectDoseResponse(readings: GlucoseReading[], injections: InjectionLog[]): DetectedPattern | null {
  const doseGroups = new Map<number, number[]>();

  for (const inj of injections) {
    const postReadings = readings.filter(r => {
      const gap = hoursApart(inj.administeredAt, r.recordedAt);
      return gap >= 3 && gap <= 6 && new Date(r.recordedAt) > new Date(inj.administeredAt);
    });
    if (postReadings.length === 0) continue;

    const dose = Math.round(inj.doseUnits * 2) / 2; // Round to 0.5
    const avgGlucose = postReadings.reduce((s, r) => s + r.valueMmol, 0) / postReadings.length;
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
      description: entries.map(e => `${e.dose}U → avg ${e.avg.toFixed(1)} mmol/L (n=${e.count})`).join('; '),
      evidence: [],
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * C13: Remission candidate — morning glucose <7 mmol/L for 14+ consecutive days.
 */
function detectRemissionCandidate(readings: GlucoseReading[], now: Date): DetectedPattern | null {
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
  const allUnder7 = recent.every(r => r.valueMmol < 7);

  if (allUnder7) {
    const avg = recent.reduce((s, r) => s + r.valueMmol, 0) / recent.length;
    return {
      type: 'remission_candidate',
      confidence: recent.length >= 10 ? 'high' : 'medium',
      description: `${recent.length} morning readings all <7 mmol/L over 14 days (avg ${avg.toFixed(1)})`,
      evidence: recent.slice(-5).map(r => r.id),
      detectedAt: new Date().toISOString(),
    };
  }
  return null;
}

/**
 * Main entry point — detect all patterns.
 */
export function detectPatterns(input: PatternInput): DetectedPattern[] {
  const { readings, injections, feedings, now = new Date() } = input;
  const patterns: DetectedPattern[] = [];

  const detectors = [
    () => detectSomogyi(readings),
    () => detectDawnPhenomenon(readings),
    () => detectPostMealSpike(readings, feedings),
    () => detectMissedInjectionImpact(readings, injections),
    () => detectFoodCorrelation(readings, feedings),
    () => detectDoseResponse(readings, injections),
    () => detectRemissionCandidate(readings, now),
  ];

  for (const detect of detectors) {
    const result = detect();
    if (result) patterns.push(result);
  }

  return patterns;
}
