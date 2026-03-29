/**
 * Types for AI-powered glucose prediction system.
 *
 * The prediction pipeline: collectData → buildPrompt → AI call → parse response → cache.
 */

// ─── Prediction Result (AI output) ───

export type PredictionStatus = 'success' | 'insufficient_data' | 'error';

export interface GlucosePredictionPoint {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Predicted glucose in mmol/L */
  predictedMmol: number;
  /** Lower bound of 80% confidence interval */
  confidenceLow: number;
  /** Upper bound of 80% confidence interval */
  confidenceHigh: number;
}

export type ChecklistPriority = 'high' | 'medium' | 'low';
export type ChecklistCategory = 'feeding' | 'glucose_check' | 'injection' | 'vet_visit' | 'general';

export interface PredictionChecklist {
  category: ChecklistCategory;
  priority: ChecklistPriority;
  title: string;
  description: string;
  /** Optional timing hint, e.g. "before morning injection" */
  timing?: string;
}

export type RemissionProbability = 'very_low' | 'low' | 'moderate' | 'high';

export interface RemissionReport {
  probability: RemissionProbability;
  /** 0-100 */
  probabilityPercent: number;
  /** Factors influencing the assessment, e.g. "+good diet control", "-high average glucose" */
  factors: string[];
  summary: string;
  generatedAt: string;
}

export interface PredictionResult {
  status: PredictionStatus;
  /** 3-7 day forecast points. Empty if insufficient data. */
  predictions: GlucosePredictionPoint[];
  /** Actionable recommendations. Empty if insufficient data. */
  checklist: PredictionChecklist[];
  /** Human-readable summary of the analysis. */
  summary: string;
  /** Weekly remission report — only if enough data (60+ readings, 30+ days). */
  remission?: RemissionReport;
  /** Medical disclaimer text. */
  disclaimer: string;
  /** ISO datetime when this result was generated. */
  generatedAt: string;
  /** ISO datetime when this result expires (6h after generation). */
  expiresAt: string;
}

// ─── Data Snapshot (AI input) ───

export interface GlucoseStats {
  avg7d: number | null;
  avg30d: number | null;
  min7d: number | null;
  max7d: number | null;
  min30d: number | null;
  max30d: number | null;
  inRangePercent7d: number | null;
  inRangePercent30d: number | null;
  /** 'rising' | 'falling' | 'stable' | 'unknown' */
  trend7d: string;
  totalReadings: number;
}

export interface InjectionStats {
  avgDose7d: number | null;
  avgDose30d: number | null;
  /** Whether dose has been consistent (std dev < 0.5 IU) */
  doseConsistent: boolean;
  insulinType: string | null;
  totalInjections: number;
}

export interface FeedingStats {
  /** Average feedings per day over last 7 days */
  avgFeedingsPerDay7d: number | null;
  /** Whether feeding schedule is regular (±2h from average times) */
  feedingRegular: boolean;
  primaryFoodType: string | null;
  totalFeedings: number;
}

export interface DataQuality {
  glucoseReadingsCount: number;
  daysTracked: number;
  /** At least 14 readings over 7+ days */
  sufficientForBasicPrediction: boolean;
  /** At least 60 readings over 30+ days */
  sufficientForRemissionAssessment: boolean;
  /** Earliest reading date (ISO) */
  firstReadingDate: string | null;
  /** Latest reading date (ISO) */
  lastReadingDate: string | null;
}

export interface PetSnapshot {
  name: string;
  species: string;
  breed?: string;
  gender: string;
  birthYear?: number;
  weightKg?: number;
  diagnosisDate?: string;
  diabetesType: string;
  insulinType?: string;
}

export interface AnalyzerSummary {
  /** Overall risk score 0-100 */
  riskScore: number;
  riskLevel: string;
  /** Trend direction */
  trendDirection: string | null;
  /** CV% */
  cv: number | null;
  /** Time in target range % */
  timeInRange: number | null;
  /** Moving averages */
  movingAvg7d: number | null;
  movingAvg14d: number | null;
  /** Detected clinical patterns */
  patterns: string[];
}

export interface PredictionDataSnapshot {
  pet: PetSnapshot;
  glucose: GlucoseStats;
  injections: InjectionStats;
  feedings: FeedingStats;
  /** Raw recent readings for AI context (last 14 days) */
  recentReadings: { date: string; valueMmol: number; mealRelation: string }[];
  /** Raw recent injections (last 14 days) */
  recentInjections: { date: string; doseUnits: number; insulinType: string }[];
  /** Raw recent feedings (last 14 days) */
  recentFeedings: { date: string; foodType?: string; amountGrams?: number; carbsDM?: number }[];
  /** Symptom summaries (last 30 days) */
  recentSymptoms: { date: string; types: string[]; severity: string }[];
  dataQuality: DataQuality;
  /** Local analyzer results (if available) */
  analyzer?: AnalyzerSummary;
  /** Scheduled injections per day from user settings */
  scheduledInjectionsPerDay?: number;
  /** ISO date of the last vet visit (from expenses with category 'vetVisit') */
  lastVetVisitDate?: string;
  language: 'en' | 'ru';
}
