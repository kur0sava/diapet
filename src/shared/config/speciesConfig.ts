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
  /**
   * True when this insulin is NOT a first-line choice for this species and
   * should be used only when first-line options are unavailable. UI should
   * surface a caution label (e.g. feline NPH — short duration, low remission
   * rate ~25% vs glargine 50–90% per ISFM 2023).
   */
  notFirstChoice?: boolean;
  /** Short rationale shown in the UI when notFirstChoice is true */
  notFirstChoiceReason?: { ru: string; en: string };
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
    // ISFM 2022/2023 feline glargine PK; matches encyclopedia article insulin_types.ts
    name: 'Glargine (Lantus)',
    concentration: 'U-100',
    onsetHours: [1, 3],
    peakHours: [4, 8],
    durationHours: [10, 16],
    // Sanofi Lantus SPC 6.3: opened vial 28 days at <=25C. Same as the dog
    // config and every encyclopedia article; was erroneously 60.
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
    shelfLifeDays: 42,
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
    // Caninsulin is a suspension — MSD label mandates refrigeration
    // (2–8 °C) both before and after opening. Room-temp storage
    // accelerates settling of the crystalline fraction and alters dosing.
    name: 'Caninsulin (Lente)',
    concentration: 'U-40',
    onsetHours: [1, 4],
    peakHours: [2, 8],
    durationHours: [8, 16],
    shelfLifeDays: 42,
    storageAfterOpening: 'fridge',
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
    notFirstChoice: true,
    notFirstChoiceReason: {
      ru: 'Для кошек NPH — не первый выбор: короткая продолжительность действия и низкая вероятность ремиссии (~25% против 50–90% на гларгине). Предпочтительны гларгин, PZI или детемир. Используй NPH только если гларгин/PZI недоступны, и обсуди это с ветеринаром.',
      en: 'For cats, NPH is NOT a first-choice insulin: short duration and low remission rate (~25% vs 50–90% on glargine). Preferred options are glargine, PZI, or detemir. Use NPH only if first-line options are unavailable, and discuss with your vet.',
    },
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
    // ISFM 2023 / Rand 2012 starting dose is 0.25–0.5 IU/kg BID, with a
    // per-cat STARTING cap of 2 IU BID. Higher doses are adjusted by the
    // vet after glucose curves. "typicalMax" here is the expected steady
    // range for most cats without insulin resistance work-up.
    typicalDoseMin: 1,
    typicalDoseMax: 2,
    warningDose: 3,
    dangerDose: 6,
    absoluteMaxDose: 10,
    commonTypes: CAT_INSULIN_TYPES,
  },

  analyzer: {
    // ISFM 2023 / Roomp & Rand 2009: Somogyi (insulin-induced hyperglycemia)
    // is defined by a nadir <3.3 mmol/L followed by rebound >15 mmol/L
    // within the same cycle. The previous 4.0/18 thresholds were too
    // permissive on the nadir side and too strict on the rebound side,
    // causing missed detections.
    somogyiNadirThreshold: 3.3,
    somogyiReboundThreshold: 15,
    postMealSpikeThreshold: 15,
    missedInjectionThreshold: 15,
    remissionRelevant: true,
    // Roomp & Rand 2009: fasting <6 mmol/L without insulin is the
    // remission-candidate signal. 7 was borderline hyperglycemic.
    remissionMorningThreshold: 6,
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
    // MSD label: refrigerate 2–8 °C before and after opening. Suspension.
    name: 'Caninsulin (Lente)',
    concentration: 'U-40',
    onsetHours: [1, 4],
    peakHours: [4, 8],
    durationHours: [8, 24],
    shelfLifeDays: 28,
    storageAfterOpening: 'fridge',
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
    // AAHA 2018 / Fleeman & Rand: for dogs the first-line insulins are Lente
    // (Caninsulin/Vetsulin) and NPH. Glargine/detemir are second-line, used
    // only when response to first-line is poor.
    notFirstChoice: true,
    notFirstChoiceReason: {
      ru: 'Для собак гларгин — не первый выбор. Первая линия — Caninsulin/Vetsulin (ленте) или NPH. Гларгин назначают, если ответ на первую линию плохой. Обсуди с ветеринаром.',
      en: 'For dogs, glargine is not a first-choice insulin. First-line options are Caninsulin/Vetsulin (lente) or NPH; glargine is used if response to first-line is poor. Discuss with your vet.',
    },
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
    // Detemir is extremely potent in dogs (very low per-kg dosing) and is a
    // second-line option, not first-choice (AAHA 2018 / Fleeman & Rand).
    notFirstChoice: true,
    notFirstChoiceReason: {
      ru: 'Для собак детемир — не первый выбор и очень мощный (крайне низкие дозы на кг). Первая линия — Caninsulin/Vetsulin или NPH. Только по назначению ветеринара.',
      en: 'For dogs, detemir is not first-choice and is very potent (very low per-kg doses). First-line options are Caninsulin/Vetsulin or NPH. Use only under veterinary guidance.',
    },
  },
];

const DOG_CONFIG: SpeciesConfig = {
  species: 'dog',

  glucose: {
    normalLow: 3.3,
    normalHigh: 6.1,
    targetLow: 4.4,
    targetHigh: 8.0,
    // TIR upper bound. AAHA 2018 (Behrend et al.): a well-controlled diabetic
    // dog acceptably runs up to ~13.9-16.7 mmol/L through the day; postprandial
    // peaks of 10-14 on Lente/NPH BID are normal, not poor control. targetHigh
    // (8.0) is the ideal nadir, kept separate. Was 10.0 — too tight, it
    // systematically under-counted TIR and inflated risk for normal dogs.
    rangeHigh: 13.9,
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
    // For dogs these absolute values are fallbacks only — actual thresholds
    // must be computed per-weight via getInsulinThresholds(species, weightKg).
    // AAHA 2018: starting 0.25 IU/kg BID, typical max ~1.0 IU/kg, absolute
    // red line ~1.5 IU/kg (above this insulin resistance workup required).
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
    // Giant breeds (Mastiff, St. Bernard) can legitimately exceed 80 kg.
    maxWeightKg: 100,
    maxAgeYears: 20,
  },

  nutrition: {
    // AAHA 2018 / ACVIM: diabetic dogs benefit from moderate-fat, moderate-
    // complex-carb, high-fiber diets. High fat (>25% DM) raises pancreatitis
    // risk — a major comorbidity/trigger of insulin resistance in dogs.
    carbsDMGood: 30,
    carbsDMAcceptable: 40,
    proteinDMMin: 25,
    fatDMMax: 25,
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
      'cataracts',
      'urinaryInfection',
      'panting',
      'ataxia',
      'other',
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
 *
 * Dog dosing rationale (AAHA 2018, ECVIM-CA 2022, Feldman & Nelson 2015):
 *   - Starting dose:     0.25 IU/kg BID
 *   - Typical range:     0.25–1.0 IU/kg BID (most stable dogs)
 *   - warning:           0.75 IU/kg — above expected therapeutic range,
 *                        verify technique, concentration, confounders
 *   - danger:            1.5 IU/kg — red line; insulin resistance work-up
 *                        required (Cushing, infection, steroids, diestrus)
 *   - absoluteMax:       2.0 IU/kg OR 40 IU, whichever is lower.
 *                        Doses above this virtually never indicated and
 *                        carry high hypoglycemia risk. IMPORTANT: for toy
 *                        breeds (e.g. 3 kg) absoluteMax = 6 IU, not 20.
 *   - Floor:             minimum absoluteMax of 3 IU so the validator
 *                        never blocks a clinically plausible small-dog dose.
 */
export function getInsulinThresholds(
  species: PetSpecies,
  weightKg?: number
): { warning: number; danger: number; absoluteMax: number } {
  const config = getSpeciesConfig(species);

  if (!config.insulin.dosePerKg || !weightKg || weightKg <= 0) {
    return {
      warning: config.insulin.warningDose,
      danger: config.insulin.dangerDose,
      absoluteMax: config.insulin.absoluteMaxDose,
    };
  }

  // Dogs: thresholds scale with body weight. Keep one decimal place so
  // small-dog warnings (e.g. 3 kg → warn at 2.25 IU) aren't lost to rounding.
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const warning = round1(weightKg * 0.75);
  const danger = round1(weightKg * 1.5);
  const absoluteMax = Math.min(round1(weightKg * 2.0), 40);
  return {
    warning: Math.max(warning, 1),
    danger: Math.max(danger, 2),
    absoluteMax: Math.max(absoluteMax, 3),
  };
}
