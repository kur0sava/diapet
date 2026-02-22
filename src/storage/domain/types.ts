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

export interface UpdatePetDTO extends Partial<CreatePetDTO> {}

// --------------- Glucose types ---------------

export type MealRelation = 'before_meal' | 'after_meal' | 'fasting' | 'unspecified';
export type GlucoseUnit = 'mmol/L' | 'mg/dL';
export type GlucoseLevel = 'low' | 'normal' | 'high' | 'very_high';

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
  low: { max: 4.0, color: '#FF3B30' },
  normal: { min: 4.0, max: 9.0, color: '#34C759' },
  high: { min: 9.0, max: 14.0, color: '#FF9500' },
  very_high: { min: 14.0, color: '#FF3B30' },
};

export function getGlucoseLevel(valueMmol: number): GlucoseLevel {
  if (valueMmol < 4.0) return 'low';
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
