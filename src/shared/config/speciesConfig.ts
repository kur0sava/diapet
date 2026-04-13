/**
 * Species-specific configuration — single source of truth for all
 * animal-dependent clinical parameters, thresholds, and UI settings.
 *
 * Cat values are identical to previously hardcoded constants.
 * Dog values are based on AAHA 2018, ECVIM-CA 2022, Feldman & Nelson 2015.
 */
import type { PetSpecies, SymptomType } from '@storage/domain/types';

// --------------- Types ---------------

export interface GlucoseRangeEntry {
  key: string;
  max?: number;
  min?: number;
  color: string;
}

export interface InsulinTypeInfo {
  name: string;
  concentration: 'U-40' | 'U-100' | 'U-200';
  /** Onset of action in hours */
  onsetHours: [number, number];
  /** Peak (nadir) in hours */
  peakHours: [number, number];
  /** Duration in hours */
  durationHours: [number, number];
  /** Shelf life after opening in days */
  shelfLifeDays: number;
  /** Storage after opening */
  storageAfterOpening: 'room' | 'fridge';
  /** Is suspension (needs resuspending) */
  isSuspension: boolean;
}

export interface SpeciesConfig {
  species: PetSpecies;

  // --- Glucose clinical ranges (mmol/L) ---
  glucose: {
    /** Fasting normal low */
    normalLow: number;
    /** Fasting normal high */
    normalHigh: number;
    /** Therapy target low */
    targetLow: number;
    /** Therapy target high */
    targetHigh: number;
    /** Upper monitoring range (used for TIR in analyzer) */
    rangeHigh: number;
    /** Emergency hypoglycemia threshold */
    emergencyLow: number;
    /** Severe emergency hypoglycemia */
    severeLow: number;
    /** Severe hyperglycemia threshold */
    emergencyHigh: number;
    /** "Increase monitoring" hyperglycemia */
    highControlThreshold: number;
    /** Full glucose level scale */
    ranges: GlucoseRangeEntry[];
  };

  // --- Insulin ---
  insulin: {
    /** Whether dosing is per-kg (dogs) or absolute (cats) */
    dosePerKg: boolean;
    /** Typical dose range — IU for cats, IU/kg for dogs */
    typicalDoseMin: number;
    typicalDoseMax: number;
    /** Warning threshold (IU) — for cats absolute, for dogs calculated from weight */
    warningDose: number;
    /** Danger threshold (IU) */
    dangerDose: number;
    /** Absolute maximum single dose (IU) */
    absoluteMaxDose: number;
    /** Common insulin types for this species */
    commonTypes: InsulinTypeInfo[];
  };

  // --- Analyzer thresholds ---
  analyzer: {
    /** Somogyi: nadir must be below this */
    somogyiNadirThreshold: number;
    /** Somogyi: rebound must be above this */
    somogyiReboundThreshold: number;
    /** Post-meal spike threshold */
    postMealSpikeThreshold: number;
    /** Missed injection high glucose threshold */
    missedInjectionThreshold: number;
    /** Whether remission detection is relevant */
    remissionRelevant: boolean;
    /** Morning glucose threshold for remission candidate */
    remissionMorningThreshold: number;
  };

  // --- Validation ---
  validation: {
    maxWeightKg: number;
    maxAgeYears: number;
  };

  // --- Nutrition (dry matter %) ---
  nutrition: {
    /** Carbs DM% threshold for "good" verdict */
    carbsDMGood: number;
    /** Carbs DM% threshold for "acceptable" verdict */
    carbsDMAcceptable: number;
    /** Minimum protein DM% */
    proteinDMMin: number;
    /** Maximum fat DM% */
    fatDMMax: number;
    /** Whether fiber content is a primary metric */
    fiberImportant: boolean;
    /** Minimum fiber DM% (only if fiberImportant) */
    fiberDMMin?: number;
    /** High carbs DM threshold for warnings */
    highCarbsThreshold: number;
  };

  // --- Symptoms ---
  symptoms: {
    available: SymptomType[];
  };

  // --- Theme colors ---
  theme: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    gradientHeader: readonly [string, string];
    gradientHeaderDark: readonly [string, string];
    gradientHeaderRich: readonly [string, string, string];
    gradientHeaderRichDark: readonly [string, string, string];
    gradientCardAccent: readonly [string, string];
  };
}

// --------------- Cat Config ---------------

const CAT_INSULIN_TYPES: InsulinTypeInfo[] = [
  {
    name: 'Glargine (Lantus)',
    concentration: 'U-100',
    onsetHours: [2, 4],
    peakHours: [8, 14],
    durationHours: [12, 24],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: false,
  },
  {
    name: 'PZI (ProZinc)',
    concentration: 'U-40',
    onsetHours: [1, 3],
    peakHours: [3, 8],
    durationHours: [8, 16],
    shelfLifeDays: 28,
    storageAfterOpening: 'fridge',
    isSuspension: true,
  },
  {
    name: 'Detemir (Levemir)',
    concentration: 'U-100',
    onsetHours: [0.5, 2],
    peakHours: [4, 8],
    durationHours: [8, 16],
    shelfLifeDays: 42,
    storageAfterOpening: 'room',
    isSuspension: false,
  },
  {
    name: 'Caninsulin (Lente)',
    concentration: 'U-40',
    onsetHours: [1, 4],
    peakHours: [2, 8],
    durationHours: [8, 16],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: true,
  },
  {
    name: 'NPH (Humulin N)',
    concentration: 'U-100',
    onsetHours: [0.5, 2],
    peakHours: [1, 6],
    durationHours: [4, 12],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: true,
  },
];

const CAT_CONFIG: SpeciesConfig = {
  species: 'cat',

  glucose: {
    normalLow: 3.9,
    normalHigh: 8.3,
    targetLow: 4.0,
    targetHigh: 9.0,
    rangeHigh: 12.0,
    emergencyLow: 2.8,
    severeLow: 2.2,
    emergencyHigh: 30,
    highControlThreshold: 14.0,
    ranges: [
      { key: 'severe_low', max: 2.8, color: '#CC0000' },
      { key: 'low', min: 2.8, max: 3.3, color: '#FF3B30' },
      { key: 'below_target', min: 3.3, max: 4.0, color: '#FF9500' },
      { key: 'normal', min: 4.0, max: 9.0, color: '#34C759' },
      { key: 'high', min: 9.0, max: 14.0, color: '#FF9500' },
      { key: 'very_high', min: 14.0, color: '#FF3B30' },
    ],
  },

  insulin: {
    dosePerKg: false,
    typicalDoseMin: 1,
    typicalDoseMax: 4,
    warningDose: 4,
    dangerDose: 6,
    absoluteMaxDose: 10,
    commonTypes: CAT_INSULIN_TYPES,
  },

  analyzer: {
    somogyiNadirThreshold: 4,
    somogyiReboundThreshold: 18,
    postMealSpikeThreshold: 15,
    missedInjectionThreshold: 15,
    remissionRelevant: true,
    remissionMorningThreshold: 7,
  },

  validation: {
    maxWeightKg: 15,
    maxAgeYears: 30,
  },

  nutrition: {
    carbsDMGood: 10,
    carbsDMAcceptable: 15,
    proteinDMMin: 40,
    fatDMMax: 40,
    fiberImportant: false,
    highCarbsThreshold: 15,
  },

  symptoms: {
    available: [
      'hindLimbWeakness',
      'weightLoss',
      'polyuria',
      'polydipsia',
      'lossOfAppetite',
      'behavioralChanges',
      'lethargy',
      'vomiting',
      'diarrhea',
      'other',
    ],
  },

  theme: {
    primary: '#4F8EF7',
    primaryDark: '#2D6FD4',
    primaryLight: '#E8F0FE',
    secondary: '#7C5CBF',
    secondaryLight: '#F0EBFF',
    gradientHeader: ['#4F8EF7', '#6366F1'] as const,
    gradientHeaderDark: ['#1C1C2E', '#2D2D44'] as const,
    gradientHeaderRich: ['#4F8EF7', '#6366F1', '#7C5CBF'] as const,
    gradientHeaderRichDark: ['#1C1C2E', '#2D2D44', '#3D2D5C'] as const,
    gradientCardAccent: ['#4F8EF7', '#6C63FF'] as const,
  },
};

// --------------- Dog Config ---------------

const DOG_INSULIN_TYPES: InsulinTypeInfo[] = [
  {
    name: 'Caninsulin (Lente)',
    concentration: 'U-40',
    onsetHours: [1, 4],
    peakHours: [4, 8],
    durationHours: [8, 24],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: true,
  },
  {
    name: 'NPH (Humulin N)',
    concentration: 'U-100',
    onsetHours: [0.5, 2],
    peakHours: [2, 8],
    durationHours: [6, 16],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: true,
  },
  {
    name: 'Glargine (Lantus)',
    concentration: 'U-100',
    onsetHours: [2, 6],
    peakHours: [6, 12],
    durationHours: [12, 24],
    shelfLifeDays: 28,
    storageAfterOpening: 'room',
    isSuspension: false,
  },
  {
    name: 'Detemir (Levemir)',
    concentration: 'U-100',
    onsetHours: [1, 2],
    peakHours: [3, 8],
    durationHours: [12, 24],
    shelfLifeDays: 42,
    storageAfterOpening: 'room',
    isSuspension: false,
  },
];

const DOG_CONFIG: SpeciesConfig = {
  species: 'dog',

  glucose: {
    normalLow: 3.3,
    normalHigh: 6.1,
    targetLow: 4.4,
    targetHigh: 8.0,
    rangeHigh: 10.0,
    emergencyLow: 3.3,
    severeLow: 2.2,
    emergencyHigh: 30,
    highControlThreshold: 16.7,
    ranges: [
      { key: 'severe_low', max: 2.2, color: '#CC0000' },
      { key: 'low', min: 2.2, max: 3.3, color: '#FF3B30' },
      { key: 'below_target', min: 3.3, max: 4.4, color: '#FF9500' },
      { key: 'normal', min: 4.4, max: 8.0, color: '#34C759' },
      { key: 'high', min: 8.0, max: 16.7, color: '#FF9500' },
      { key: 'very_high', min: 16.7, color: '#FF3B30' },
    ],
  },

  insulin: {
    dosePerKg: true,
    typicalDoseMin: 0.25,
    typicalDoseMax: 0.5,
    warningDose: 10,
    dangerDose: 15,
    absoluteMaxDose: 20,
    commonTypes: DOG_INSULIN_TYPES,
  },

  analyzer: {
    somogyiNadirThreshold: 3.3,
    somogyiReboundThreshold: 16,
    postMealSpikeThreshold: 14,
    missedInjectionThreshold: 14,
    remissionRelevant: false,
    remissionMorningThreshold: 7,
  },

  validation: {
    maxWeightKg: 80,
    maxAgeYears: 20,
  },

  nutrition: {
    carbsDMGood: 30,
    carbsDMAcceptable: 40,
    proteinDMMin: 25,
    fatDMMax: 50,
    fiberImportant: true,
    fiberDMMin: 10,
    highCarbsThreshold: 40,
  },

  symptoms: {
    available: [
      'weightLoss',
      'polyuria',
      'polydipsia',
      'lossOfAppetite',
      'behavioralChanges',
      'lethargy',
      'vomiting',
      'diarrhea',
      'other',
      // Dog-specific symptoms will be added in Phase 6
      // 'cataracts', 'urinaryInfection', 'panting', 'ataxia'
    ],
  },

  theme: {
    primary: '#E67E22',
    primaryDark: '#C0652A',
    primaryLight: '#FFF3E0',
    secondary: '#8B6914',
    secondaryLight: '#FFF8E1',
    gradientHeader: ['#E67E22', '#D35400'] as const,
    gradientHeaderDark: ['#2E1A0E', '#3D2814'] as const,
    gradientHeaderRich: ['#E67E22', '#D35400', '#8B6914'] as const,
    gradientHeaderRichDark: ['#2E1A0E', '#3D2814', '#4A3510'] as const,
    gradientCardAccent: ['#E67E22', '#D35400'] as const,
  },
};

// --------------- Public API ---------------

const CONFIGS: Record<PetSpecies, SpeciesConfig> = {
  cat: CAT_CONFIG,
  dog: DOG_CONFIG,
  other: CAT_CONFIG, // fallback to cat for now
};

/**
 * Get species-specific configuration.
 * Falls back to cat config for unknown species.
 */
export function getSpeciesConfig(species: PetSpecies): SpeciesConfig {
  return CONFIGS[species] ?? CAT_CONFIG;
}

/**
 * Calculate insulin warning/danger thresholds for dogs based on weight.
 * For cats, returns the fixed thresholds from config.
 */
export function getInsulinThresholds(
  species: PetSpecies,
  weightKg?: number
): { warning: number; danger: number; absoluteMax: number } {
  const config = getSpeciesConfig(species);

  if (!config.insulin.dosePerKg || !weightKg) {
    return {
      warning: config.insulin.warningDose,
      danger: config.insulin.dangerDose,
      absoluteMax: config.insulin.absoluteMaxDose,
    };
  }

  // For dogs: dose thresholds scale with weight
  // warning = 0.5 IU/kg (typical max), danger = 1.0 IU/kg, absolute = AAHA max
  const warning = Math.round(weightKg * 0.5);
  const danger = Math.round(weightKg * 1.0);
  return {
    warning: Math.max(warning, 2),
    danger: Math.max(danger, 4),
    absoluteMax: config.insulin.absoluteMaxDose,
  };
}
