/**
 * Risk Score Calculator — multi-factor pet health risk assessment.
 * Score 0-100: lower is better.
 */
import { GlucoseReading, InjectionLog, FeedingLog, SymptomEntry } from '@storage/domain/types';
import type { SpeciesConfig } from '@shared/config/speciesConfig';
import { toDateOnly } from '@shared/utils/dateUtils';
import { analyzeTrends, type TrendResult } from './trendEngine';

export type RiskLevel = 'excellent' | 'good' | 'attention' | 'danger';

export interface FactorScore {
  name: string;
  score: number; // 0-100, higher = worse
  weight: number;
  weighted: number; // score * weight
  detail: string;
}

export interface RiskScoreResult {
  /** Overall risk score 0-100 (lower is better) */
  totalScore: number;
  /** Classification */
  level: RiskLevel;
  /** Per-factor breakdown */
  factors: FactorScore[];
  /** Trend data used for calculation */
  trends: TrendResult;
}

interface RiskInput {
  readings: GlucoseReading[];
  injections: InjectionLog[];
  feedings: FeedingLog[];
  symptoms: SymptomEntry[];
  weightKg?: number;
  previousWeightKg?: number;
  diagnosisDays?: number;
  scheduledInjectionsPerDay?: number;
  now?: Date;
  config?: SpeciesConfig;
}

/** C14: Factor weights */
const WEIGHTS = {
  glucose_stability: 0.3,
  injection_adherence: 0.2,
  feeding_regularity: 0.15,
  symptom_severity: 0.15,
  weight_trend: 0.1,
  time_since_diagnosis: 0.1,
};

/**
 * Glucose stability — based on CV% and time-in-range.
 * CV <25% + TIR >70% = excellent (0-20)
 * CV >36% or TIR <40% = danger (80-100)
 */
function scoreGlucoseStability(trends: TrendResult): FactorScore {
  let score: number;
  let detail: string;

  if (trends.cv === null || trends.timeInRange === null) {
    score = 50;
    detail = 'Insufficient data';
  } else {
    // CV contribution (0-50)
    const cvScore = trends.cv < 25 ? 0 : trends.cv < 30 ? 20 : trends.cv < 36 ? 35 : 50;
    // TIR contribution (0-50): 100% TIR = 0, 0% TIR = 50
    const tirScore = Math.max(0, 50 - trends.timeInRange / 2);
    score = cvScore + tirScore;
    detail = `CV ${trends.cv.toFixed(0)}%, TIR ${trends.timeInRange.toFixed(0)}%`;
  }

  return {
    name: 'glucose_stability',
    score,
    weight: WEIGHTS.glucose_stability,
    weighted: score * WEIGHTS.glucose_stability,
    detail,
  };
}

/**
 * Injection adherence — ratio of actual vs expected injections.
 */
function scoreInjectionAdherence(
  injections: InjectionLog[],
  scheduledPerDay: number,
  days: number
): FactorScore {
  let score: number;
  let detail: string;

  if (scheduledPerDay <= 0 || days <= 0) {
    score = 50;
    detail = 'No schedule configured';
  } else if (days < 2) {
    // Less than two full days of history — an adherence ratio would be noise
    // (a brand-new user with perfect logging used to score ~86/100 here
    // because `expected` was always scheduledPerDay×14).
    score = 30;
    detail = 'Not enough history yet';
  } else {
    const expected = scheduledPerDay * Math.min(days, 14);
    const actual = injections.length;
    const ratio = Math.min(actual / expected, 1.0);

    score = Math.round((1 - ratio) * 100);
    detail = `${actual}/${Math.round(expected)} injections (${Math.round(ratio * 100)}%)`;
  }

  return {
    name: 'injection_adherence',
    score,
    weight: WEIGHTS.injection_adherence,
    weighted: score * WEIGHTS.injection_adherence,
    detail,
  };
}

/**
 * Feeding regularity — based on standard deviation of feeding times.
 */
function scoreFeedingRegularity(feedings: FeedingLog[]): FactorScore {
  let score: number;
  let detail: string;

  if (feedings.length < 3) {
    score = 50;
    detail = 'Insufficient feeding data';
  } else {
    // Group by date, count feedings per day. Use local-timezone date —
    // f.fedAt is a UTC ISO string and slice(0,10) would shift evening
    // feedings east of UTC into the next day, splitting one day across
    // two buckets and inflating stddev (false "irregular" score).
    const byDay = new Map<string, number>();
    feedings.forEach(f => {
      const day = toDateOnly(new Date(f.fedAt));
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    });

    const counts = [...byDay.values()];
    const avgPerDay = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((s, c) => s + (c - avgPerDay) ** 2, 0) / counts.length;
    const stddev = Math.sqrt(variance);

    // Low variance = regular feeding = good
    score = Math.min(100, Math.round(stddev * 30));
    detail = `${avgPerDay.toFixed(1)} meals/day, stddev ${stddev.toFixed(1)}`;
  }

  return {
    name: 'feeding_regularity',
    score,
    weight: WEIGHTS.feeding_regularity,
    weighted: score * WEIGHTS.feeding_regularity,
    detail,
  };
}

/**
 * Symptom severity — recent symptom count and severity.
 */
function scoreSymptomSeverity(symptoms: SymptomEntry[]): FactorScore {
  let score: number;
  let detail: string;

  if (symptoms.length === 0) {
    score = 0;
    detail = 'No symptoms recorded';
  } else {
    const severityMap = { mild: 10, moderate: 30, severe: 60 };
    const total = symptoms.reduce(
      (s, sym) => s + (severityMap[sym.severity as keyof typeof severityMap] ?? 20),
      0
    );
    score = Math.min(100, Math.round(total / symptoms.length + symptoms.length * 5));
    const severe = symptoms.filter(s => s.severity === 'severe').length;
    detail = `${symptoms.length} symptoms (${severe} severe)`;
  }

  return {
    name: 'symptom_severity',
    score,
    weight: WEIGHTS.symptom_severity,
    weighted: score * WEIGHTS.symptom_severity,
    detail,
  };
}

/**
 * Weight trend — weight loss is concerning.
 */
function scoreWeightTrend(currentKg?: number, previousKg?: number): FactorScore {
  let score: number;
  let detail: string;

  if (!currentKg || !previousKg) {
    score = 30; // neutral
    detail = 'Weight data unavailable';
  } else {
    const changePercent = ((currentKg - previousKg) / previousKg) * 100;
    if (changePercent < -10) {
      score = 90;
      detail = `Lost ${Math.abs(changePercent).toFixed(0)}% (${previousKg}→${currentKg} kg)`;
    } else if (changePercent < -5) {
      score = 60;
      detail = `Lost ${Math.abs(changePercent).toFixed(0)}% (${previousKg}→${currentKg} kg)`;
    } else if (changePercent < 5) {
      score = 0;
      detail = `Stable weight (${currentKg} kg)`;
    } else {
      score = 40;
      detail = `Gained ${changePercent.toFixed(0)}% (${previousKg}→${currentKg} kg)`;
    }
  }

  return {
    name: 'weight_trend',
    score,
    weight: WEIGHTS.weight_trend,
    weighted: score * WEIGHTS.weight_trend,
    detail,
  };
}

/**
 * Time since diagnosis — newer cases have higher inherent risk.
 */
function scoreTimeSinceDiagnosis(days?: number): FactorScore {
  let score: number;
  let detail: string;

  if (!days || days < 0) {
    score = 50;
    detail = 'Diagnosis date unknown';
  } else if (days < 30) {
    score = 80;
    detail = `${days} days — newly diagnosed`;
  } else if (days < 90) {
    score = 50;
    detail = `${days} days — stabilizing`;
  } else if (days < 365) {
    score = 25;
    detail = `${Math.round(days / 30)} months — established`;
  } else {
    score = 10;
    detail = `${Math.round(days / 365)} years — long-term`;
  }

  return {
    name: 'time_since_diagnosis',
    score,
    weight: WEIGHTS.time_since_diagnosis,
    weighted: score * WEIGHTS.time_since_diagnosis,
    detail,
  };
}

/** C15: Classify score into risk level */
function classifyRisk(score: number): RiskLevel {
  if (score <= 20) return 'excellent';
  if (score <= 40) return 'good';
  if (score <= 65) return 'attention';
  return 'danger';
}

/**
 * C14-C16: Calculate multi-factor risk score.
 */
export function calculateRiskScore(input: RiskInput): RiskScoreResult {
  const {
    readings,
    injections,
    feedings,
    symptoms,
    weightKg,
    previousWeightKg,
    diagnosisDays,
    scheduledInjectionsPerDay = 2,
    now = new Date(),
    config,
  } = input;

  // Get trends for glucose stability (species-aware)
  const trends = analyzeTrends(readings, now, config);

  // Calculate 14-day data windows
  const cutoff14d = now.getTime() - 14 * 24 * 60 * 60 * 1000;
  const recentInjections = injections.filter(
    i => new Date(i.administeredAt).getTime() >= cutoff14d
  );
  const recentFeedings = feedings.filter(f => new Date(f.fedAt).getTime() >= cutoff14d);
  const recentSymptoms = symptoms.filter(s => new Date(s.recordedAt).getTime() >= cutoff14d);

  // Adherence window must not exceed the observed history: a user 3 days in
  // can only have logged 3 days' worth of injections, so expecting 14 days
  // inflates the risk score for every new install.
  const earliestTs = Math.min(
    ...readings.map(r => new Date(r.recordedAt).getTime()),
    ...injections.map(i => new Date(i.administeredAt).getTime())
  );
  const observedDays = isFinite(earliestTs)
    ? Math.max(1, Math.min(14, Math.ceil((now.getTime() - earliestTs) / (24 * 60 * 60 * 1000))))
    : 0;

  const factors = [
    scoreGlucoseStability(trends),
    scoreInjectionAdherence(recentInjections, scheduledInjectionsPerDay, observedDays),
    scoreFeedingRegularity(recentFeedings),
    scoreSymptomSeverity(recentSymptoms),
    scoreWeightTrend(weightKg, previousWeightKg),
    scoreTimeSinceDiagnosis(diagnosisDays),
  ];

  const totalScore = Math.round(factors.reduce((s, f) => s + f.weighted, 0));

  return {
    totalScore,
    level: classifyRisk(totalScore),
    factors,
    trends,
  };
}
