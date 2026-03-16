/**
 * Collects data from all repositories and computes statistics
 * for the AI prediction prompt.
 */
import { differenceInDays, subDays, parseISO, isValid } from 'date-fns';
import { glucoseRepository, injectionRepository, feedingRepository, symptomRepository } from '@storage/database';
import type { Pet, GlucoseReading, InjectionLog, FeedingLog, SymptomEntry } from '@storage/domain/types';
import type {
  PredictionDataSnapshot,
  GlucoseStats,
  InjectionStats,
  FeedingStats,
  DataQuality,
  PetSnapshot,
} from './predictionTypes';

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

  const inRange = (v: number) => v >= 4.0 && v <= 9.0;
  const inRangePct = (vals: number[]) =>
    vals.length > 0 ? Math.round((vals.filter(inRange).length / vals.length) * 100) : null;

  // Trend: compare first half vs second half of last 7 days
  let trend7d = 'unknown';
  if (vals7.length >= 4) {
    const mid = Math.floor(vals7.length / 2);
    // readings are sorted newest-first from repo
    const recentHalf = average(vals7.slice(0, mid)) ?? 0;
    const olderHalf = average(vals7.slice(mid)) ?? 0;
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

  // Feeding regularity: check if feeding times are consistent (±2h from avg)
  let feedingRegular = false;
  if (last7.length >= 4) {
    const hours = last7.map(f => {
      const d = safeParseISO(f.fedAt);
      return d ? d.getHours() + d.getMinutes() / 60 : 12;
    });
    feedingRegular = stdDev(hours) < 2;
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

function computeDataQuality(
  glucoseReadings: GlucoseReading[],
): DataQuality {
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
  language: 'en' | 'ru',
): Promise<PredictionDataSnapshot> {
  const [allGlucose, allInjections, allFeedings, allSymptoms] = await Promise.all([
    glucoseRepository.findAllByPetId(petId),
    injectionRepository.findAllByPetId(petId),
    feedingRepository.findAllByPetId(petId),
    symptomRepository.findAllByPetId(petId),
  ]);

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
    })),
    recentSymptoms: recent30Symptoms.map(r => ({
      date: r.recordedAt,
      types: r.symptomTypes,
      severity: r.severity,
    })),
    dataQuality: computeDataQuality(allGlucose),
    language,
  };
}
