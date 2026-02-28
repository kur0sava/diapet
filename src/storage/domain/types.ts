// ============================================================
// Domain types - the single source of truth for all data models.
// Storage and shared layers import from here.
// Feature layers re-export from here for backward compatibility.
// ============================================================

// --------------- Pagination ---------------

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
}

export interface GlucoseFilter {
  dateFrom?: string;
  dateTo?: string;
  levelMin?: number;
  levelMax?: number;
  /** For disjoint level ranges (e.g. low + veryHigh) */
  levelRanges?: Array<{ min?: number; max?: number }>;
  mealRelations?: MealRelation[];
}

// --------------- Pet types ---------------

export type PetSpecies = 'cat' | 'dog' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';
export type DiabetesType = 'type1' | 'type2' | 'unknown';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  gender: PetGender;
  birthYear?: number;
  weightKg?: number;
  diagnosisDate?: string; // ISO date string
  diabetesType: DiabetesType;
  insulinType?: string;
  photoUri?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VetContact {
  id: string;
  petId?: string;
  name: string;
  phone: string;
  clinic?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreatePetDTO {
  name: string;
  species?: PetSpecies;
  breed?: string;
  gender: PetGender;
  birthYear?: number;
  weightKg?: number;
  diagnosisDate?: string;
  diabetesType?: DiabetesType;
  insulinType?: string;
  photoUri?: string;
}

export type UpdatePetDTO = Partial<CreatePetDTO>;

// --------------- Glucose types ---------------

export type MealRelation = 'before_meal' | 'after_meal' | 'fasting' | 'unspecified';
export type GlucoseUnit = 'mmol/L' | 'mg/dL';
/**
 * MH001: 4-level clinical glucose scale for cats (ISFM)
 * severe_low: < 2.8 mmol/L — clinical emergency hypoglycemia
 * low:        2.8–3.3 mmol/L — hypoglycemia, treat immediately
 * below_target: 3.3–4.0 mmol/L — below target range but not hypo
 * normal:     4.0–9.0 mmol/L — target range
 * high:       9.0–14.0 mmol/L — hyperglycemia
 * very_high:  > 14.0 mmol/L — severe hyperglycemia
 */
export type GlucoseLevel = 'severe_low' | 'low' | 'below_target' | 'normal' | 'high' | 'very_high';

/**
 * Glucose unit conversion factor based on glucose molar mass (180.156 g/mol):
 * 1 mmol/L ~= 18.0156 mg/dL
 */
export const MGDL_PER_MMOLL = 18.0156;
export const MAX_REASONABLE_GLUCOSE_MMOL = 35;
export const MAX_REASONABLE_GLUCOSE_MGDL = Math.round(MAX_REASONABLE_GLUCOSE_MMOL * MGDL_PER_MMOLL);

export interface GlucoseReading {
  id: string;
  petId: string;
  valueMmol: number;
  valueMgdl: number;
  mealRelation: MealRelation;
  insulinDose?: number;
  insulinType?: string;
  notes?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlucoseDTO {
  petId: string;
  value: number;
  unit: GlucoseUnit;
  mealRelation?: MealRelation;
  insulinDose?: number;
  insulinType?: string;
  notes?: string;
  recordedAt?: string;
}

export interface InjectionLog {
  id: string;
  petId: string;
  insulinType: string;
  doseUnits: number;
  notes?: string;
  administeredAt: string;
  createdAt: string;
}

export interface CreateInjectionDTO {
  petId: string;
  insulinType: string;
  doseUnits: number;
  notes?: string;
  administeredAt?: string;
}

export interface FeedingLog {
  id: string;
  petId: string;
  foodType?: string;
  amountGrams?: number;
  notes?: string;
  fedAt: string;
  createdAt: string;
}

export interface CreateFeedingDTO {
  petId: string;
  foodType?: string;
  amountGrams?: number;
  notes?: string;
  fedAt?: string;
}

export const GLUCOSE_RANGES = {
  severe_low:   { max: 2.8,  color: '#CC0000' }, // Deep red — emergency
  low:          { min: 2.8,  max: 3.3,  color: '#FF3B30' }, // Red — hypoglycemia
  below_target: { min: 3.3,  max: 4.0,  color: '#FF9500' }, // Orange — below target
  normal:       { min: 4.0,  max: 9.0,  color: '#34C759' }, // Green — target
  high:         { min: 9.0,  max: 14.0, color: '#FF9500' }, // Orange — hyperglycemia
  very_high:    { min: 14.0, color: '#FF3B30' },            // Red — severe hyper
};

export function mmolToMgdl(valueMmol: number): number {
  return Math.round(valueMmol * MGDL_PER_MMOLL);
}

export function mgdlToMmol(valueMgdl: number): number {
  return valueMgdl / MGDL_PER_MMOLL;
}

export function convertGlucoseValue(value: number, from: GlucoseUnit, to: GlucoseUnit): number {
  if (from === to) return value;
  return to === 'mg/dL' ? mmolToMgdl(value) : mgdlToMmol(value);
}

export function getGlucoseLevel(valueMmol: number): GlucoseLevel {
  if (valueMmol < 2.8) return 'severe_low';
  if (valueMmol < 3.3) return 'low';
  if (valueMmol < 4.0) return 'below_target';
  if (valueMmol <= 9.0) return 'normal';
  if (valueMmol <= 14.0) return 'high';
  return 'very_high';
}

export function getGlucoseColor(valueMmol: number): string {
  const level = getGlucoseLevel(valueMmol);
  return GLUCOSE_RANGES[level].color;
}

// --------------- Symptom types ---------------

export type SymptomType =
  | 'hindLimbWeakness'
  | 'weightLoss'
  | 'polyuria'
  | 'polydipsia'
  | 'lossOfAppetite'
  | 'behavioralChanges'
  | 'lethargy'
  | 'vomiting'
  | 'diarrhea'
  | 'other';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export interface SymptomEntry {
  id: string;
  petId: string;
  symptomTypes: SymptomType[];
  severity: SymptomSeverity;
  photoUris: string[];
  notes?: string;
  glucoseReadingId?: string;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSymptomDTO {
  petId: string;
  symptomTypes: SymptomType[];
  severity?: SymptomSeverity;
  photoUris?: string[];
  notes?: string;
  glucoseReadingId?: string;
  recordedAt?: string;
}

// --------------- Expense types ---------------

export type ExpenseCategory =
  | 'insulin'
  | 'testStrips'
  | 'vetVisit'
  | 'medication'
  | 'food'
  | 'other';

export interface Expense {
  id: string;
  petId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  petId: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  description?: string;
  date?: string;
}

export interface MonthlyStats {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  currency: string;
}

// --------------- Schedule types ---------------

export interface Schedule {
  id: string;
  petId: string;
  timeOfDay: string; // HH:mm
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
}
