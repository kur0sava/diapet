/**
 * Collects data from all repositories and computes statistics
 * for the AI prediction prompt.
 */
import { subDays, parseISO, isValid } from 'date-fns';
import {
  glucoseRepository,
  injectionRepository,
  feedingRepository,
  symptomRepository,
  expenseRepository,
  scheduleRepository,
} from '@storage/database';
import type { Pet, GlucoseReading, InjectionLog, FeedingLog } from '@storage/domain/types';
import type {
  PredictionDataSnapshot,
  GlucoseStats,
  InjectionStats,
  FeedingStats,
  DataQuality,
  PetSnapshot,
  AnalyzerSummary,
} from './predictionTypes';
import { analyzeTrends } from '@features/analyzer/engine/trendEngine';
import { detectPatterns } from '@features/analyzer/engine/patternDetector';
import { calculateRiskScore } from '@features/analyzer/engine/riskScoreCalculator';

// ─── Helpers ───

function safeParseISO(s: string): Date | null {
  const d = parseISO(s);
  return isValid(d) ? d : null;
}

function filterByDays<T>(items: T[], dateExtractor: (item: T) => string, days: number): T[] {
  const cutoff = subDays(new Date(), days).getTime();
  return items.filter(item => {
    const d = safeParseISO(dateExtractor(item));
    return d && d.getTime() >= cutoff;
  });
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stdDev(nums: number[]): number {
  if (nums.length < 2) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const sqDiffs = nums.map(n => (n - avg) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / nums.length);
}

// ─── Stats Computation ───

function computeGlucoseStats(all: GlucoseReading[]): GlucoseStats {
  const last7 = filterByDays(all, r => r.recordedAt, 7);
  const last30 = filterByDays(all, r => r.recordedAt, 30);

  const vals7 = last7.map(r => r.valueMmol);
  const vals30 = last30.map(r => r.valueMmol);

  // BL-08: Use ISFM feline target range (4-12 mmol/L), consistent with trendEngine
  const inRange = (v: number) => v >= 4.0 && v <= 12.0;
  const inRangePct = (vals: number[]) =>
    vals.length > 0 ? Math.round((vals.filter(inRange).length / vals.length) * 100) : null;

  // Trend: compare first half vs second half of last 7 days
  let trend7d = 'unknown';
  if (vals7.length >= 4) {
    const mid = Math.floor(vals7.length / 2);
    // readings are sorted oldest-first (ASC) from repo
    const olderHalf = average(vals7.slice(0, mid)) ?? 0;
    const recentHalf = average(vals7.slice(mid)) ?? 0;
    const diff = recentHalf - olderHalf;
    if (diff > 1.0) trend7d = 'rising';
    else if (diff < -1.0) trend7d = 'falling';
    else trend7d = 'stable';
  }

  return {
    avg7d: average(vals7),
    avg30d: average(vals30),
    min7d: vals7.length > 0 ? Math.min(...vals7) : null,
    max7d: vals7.length > 0 ? Math.max(...vals7) : null,
    min30d: vals30.length > 0 ? Math.min(...vals30) : null,
    max30d: vals30.length > 0 ? Math.max(...vals30) : null,
    inRangePercent7d: inRangePct(vals7),
    inRangePercent30d: inRangePct(vals30),
    trend7d,
    totalReadings: all.length,
  };
}

function computeInjectionStats(all: InjectionLog[]): InjectionStats {
  const last7 = filterByDays(all, r => r.administeredAt, 7);
  const last30 = filterByDays(all, r => r.administeredAt, 30);

  const doses7 = last7.map(r => r.doseUnits);
  const doses30 = last30.map(r => r.doseUnits);

  // Most common insulin type
  const typeCounts = new Map<string, number>();
  for (const inj of all) {
    typeCounts.set(inj.insulinType, (typeCounts.get(inj.insulinType) ?? 0) + 1);
  }
  let insulinType: string | null = null;
  let maxCount = 0;
  for (const [type, count] of typeCounts) {
    if (count > maxCount) {
      maxCount = count;
      insulinType = type;
    }
  }

  return {
    avgDose7d: average(doses7),
    avgDose30d: average(doses30),
    doseConsistent: stdDev(doses30) < 0.5,
    insulinType,
    totalInjections: all.length,
  };
}

function computeFeedingStats(all: FeedingLog[]): FeedingStats {
  const last7 = filterByDays(all, r => r.fedAt, 7);

  // Average feedings per day
  let avgFeedingsPerDay7d: number | null = null;
  if (last7.length > 0) {
    const days = new Set(last7.map(f => f.fedAt.slice(0, 10)));
    avgFeedingsPerDay7d = Math.round((last7.length / Math.max(days.size, 1)) * 10) / 10;
  }

  // Feeding regularity: group by day and check consistency of per-day meal count and timing
  let feedingRegular = false;
  if (last7.length >= 4) {
    // Group feedings by day
    const byDay = new Map<string, number[]>();
    for (const f of last7) {
      const d = safeParseISO(f.fedAt);
      if (!d) continue;
      const dayKey = f.fedAt.slice(0, 10);
      const hours = byDay.get(dayKey) ?? [];
      hours.push(d.getHours() + d.getMinutes() / 60);
      byDay.set(dayKey, hours);
    }
    // Check consistency: same number of meals per day and each meal slot is consistent
    const dayCounts = [...byDay.values()].map(h => h.length);
    const countConsistent = dayCounts.length >= 2 && stdDev(dayCounts) < 0.5;
    // Sort each day's hours and check consistency of each slot across days
    const sortedDays = [...byDay.values()].map(h => h.sort((a, b) => a - b));
    const mealsPerDay = Math.round(average(dayCounts) ?? 2);
    let slotConsistent = true;
    for (let slot = 0; slot < mealsPerDay; slot++) {
      const slotHours = sortedDays.filter(d => d.length > slot).map(d => d[slot]);
      if (slotHours.length >= 2 && stdDev(slotHours) > 2) {
        slotConsistent = false;
        break;
      }
    }
    feedingRegular = countConsistent && slotConsistent;
  }

  // Most common food type
  const typeCounts = new Map<string, number>();
  for (const f of all) {
    if (f.foodType) typeCounts.set(f.foodType, (typeCounts.get(f.foodType) ?? 0) + 1);
  }
  let primaryFoodType: string | null = null;
  let maxCount = 0;
  for (const [type, count] of typeCounts) {
    if (count > maxCount) {
      maxCount = count;
      primaryFoodType = type;
    }
  }

  return {
    avgFeedingsPerDay7d,
    feedingRegular,
    primaryFoodType,
    totalFeedings: all.length,
  };
}

function computeDataQuality(glucoseReadings: GlucoseReading[]): DataQuality {
  const dates = glucoseReadings.map(r => r.recordedAt.slice(0, 10));
  const uniqueDays = new Set(dates);

  let firstReadingDate: string | null = null;
  let lastReadingDate: string | null = null;
  if (glucoseReadings.length > 0) {
    const sorted = [...glucoseReadings].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    firstReadingDate = sorted[0].recordedAt;
    lastReadingDate = sorted[sorted.length - 1].recordedAt;
  }

  const daysTracked = uniqueDays.size;

  return {
    glucoseReadingsCount: glucoseReadings.length,
    daysTracked,
    sufficientForBasicPrediction: glucoseReadings.length >= 14 && daysTracked >= 7,
    sufficientForRemissionAssessment: glucoseReadings.length >= 60 && daysTracked >= 30,
    firstReadingDate,
    lastReadingDate,
  };
}

// ─── Main Collector ───

export async function collectPredictionData(
  petId: string,
  pet: Pet,
  language: 'en' | 'ru'
): Promise<PredictionDataSnapshot> {
  const [allGlucose, allInjections, allFeedings, allSymptoms, allExpenses, injectionSchedule] =
    await Promise.all([
      glucoseRepository.findAllByPetId(petId),
      injectionRepository.findAllByPetId(petId),
      feedingRepository.findAllByPetId(petId),
      symptomRepository.findAllByPetId(petId),
      expenseRepository.findByPetId(petId),
      scheduleRepository.getInjectionTimes(petId),
    ]);

  // C34: Find last vet visit from expenses
  const vetVisits = allExpenses
    .filter(e => e.category === 'vetVisit')
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastVetVisitDate = vetVisits.length > 0 ? vetVisits[0].date : undefined;

  // C33: Scheduled injections per day
  const scheduledInjectionsPerDay = injectionSchedule.length || 2;

  const petSnapshot: PetSnapshot = {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    birthYear: pet.birthYear,
    weightKg: pet.weightKg,
    diagnosisDate: pet.diagnosisDate,
    diabetesType: pet.diabetesType,
    insulinType: pet.insulinType,
  };

  // Recent raw data for AI context (last 14 days)
  const recent14Glucose = filterByDays(allGlucose, r => r.recordedAt, 14);
  const recent14Injections = filterByDays(allInjections, r => r.administeredAt, 14);
  const recent14Feedings = filterByDays(allFeedings, r => r.fedAt, 14);
  const recent30Symptoms = filterByDays(allSymptoms, r => r.recordedAt, 30);

  // MED-08: Window data to 60 days for analyzer (pattern/risk/trend) to limit memory
  const recent60Glucose = filterByDays(allGlucose, r => r.recordedAt, 60);
  const recent60Injections = filterByDays(allInjections, r => r.administeredAt, 60);
  const recent60Feedings = filterByDays(allFeedings, r => r.fedAt, 60);
  const recent60Symptoms = filterByDays(allSymptoms, r => r.recordedAt, 60);

  // Run local analyzer for AI context enrichment
  let analyzer: AnalyzerSummary | undefined;
  if (recent60Glucose.length >= 3) {
    const now = new Date();
    const trends = analyzeTrends(recent60Glucose, now);
    const patterns = detectPatterns({
      readings: recent60Glucose,
      injections: recent60Injections,
      feedings: recent60Feedings,
      now,
    });
    const risk = calculateRiskScore({
      readings: recent60Glucose,
      injections: recent60Injections,
      feedings: recent60Feedings,
      symptoms: recent60Symptoms,
      weightKg: pet.weightKg,
      diagnosisDays: pet.diagnosisDate
        ? Math.floor(
            (now.getTime() - new Date(pet.diagnosisDate).getTime()) / (24 * 60 * 60 * 1000)
          )
        : undefined,
      now,
    });
    analyzer = {
      riskScore: risk.totalScore,
      riskLevel: risk.level,
      trendDirection: trends.direction,
      cv: trends.cv,
      timeInRange: trends.timeInRange,
      movingAvg7d: trends.movingAverage7d,
      movingAvg14d: trends.movingAverage14d,
      patterns: patterns.map(p => `${p.type}: ${p.description} (${p.confidence})`),
    };
  }

  return {
    pet: petSnapshot,
    glucose: computeGlucoseStats(allGlucose),
    injections: computeInjectionStats(allInjections),
    feedings: computeFeedingStats(allFeedings),
    recentReadings: recent14Glucose.map(r => ({
      date: r.recordedAt,
      valueMmol: r.valueMmol,
      mealRelation: r.mealRelation,
    })),
    recentInjections: recent14Injections.map(r => ({
      date: r.administeredAt,
      doseUnits: r.doseUnits,
      insulinType: r.insulinType,
    })),
    recentFeedings: recent14Feedings.map(r => ({
      date: r.fedAt,
      foodType: r.foodType ?? undefined,
      amountGrams: r.amountGrams ?? undefined,
      carbsDM: r.carbsDM ?? undefined,
    })),
    recentSymptoms: recent30Symptoms.map(r => ({
      date: r.recordedAt,
      types: r.symptomTypes,
      severity: r.severity,
    })),
    dataQuality: computeDataQuality(allGlucose),
    analyzer,
    scheduledInjectionsPerDay,
    lastVetVisitDate,
    language,
  };
}
