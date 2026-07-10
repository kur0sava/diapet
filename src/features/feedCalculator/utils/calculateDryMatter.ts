import { getFoodVerdict } from '@features/encyclopedia/data/diabeticFoods';

export interface MacroInput {
  protein: number;
  fat: number;
  fiber: number;
  ash: number;
  moisture: number;
}

export interface NutritionThresholds {
  carbsDMGood: number;
  carbsDMAcceptable: number;
  proteinDMMin: number;
  fatDMMax: number;
  fiberImportant?: boolean;
  fiberDMMin?: number;
}

export interface DryMatterResult {
  carbs: number;
  dryMatter: number;
  carbsDM: number;
  proteinDM: number;
  fatDM: number;
  fiberDM: number;
  verdict: 'good' | 'acceptable' | 'bad';
  proteinOk: boolean;
  fatOk: boolean;
  fiberOk?: boolean;
}

/** Default cat thresholds (backward compatible) */
const CAT_DEFAULTS: NutritionThresholds = {
  carbsDMGood: 10,
  carbsDMAcceptable: 15,
  proteinDMMin: 40,
  fatDMMax: 40,
};

export function calculateDryMatter(
  input: MacroInput,
  thresholds?: NutritionThresholds,
  species: 'cat' | 'dog' = 'cat'
): DryMatterResult | null {
  const { protein, fat, fiber, ash, moisture } = input;
  const t = thresholds ?? CAT_DEFAULTS;

  // Guard against negative inputs
  if (protein < 0 || fat < 0 || fiber < 0 || ash < 0 || moisture < 0) return null;

  const total = protein + fat + fiber + ash + moisture;
  if (total > 100) return null;

  const dryMatter = 100 - moisture;
  if (dryMatter <= 0) return null;

  const carbs = 100 - protein - fat - fiber - ash - moisture;
  if (carbs < 0) return null;
  const carbsDM = (carbs / dryMatter) * 100;
  const proteinDM = (protein / dryMatter) * 100;
  const fatDM = (fat / dryMatter) * 100;
  const fiberDM = (fiber / dryMatter) * 100;

  // B1/B2 (audit): use the SAME verdict function as the food catalog so the
  // calculator and the guide never disagree on the same food. Previously the
  // headline verdict here was carbs-only for every species — which contradicted
  // the dog model (fat + fibre, carbs "less important") and used a looser cat
  // cutoff (<10% DM) than the catalog (≤7%). getFoodVerdict is the single
  // source of truth; `thresholds` now only drives the secondary macro chips.
  const verdict = getFoodVerdict(carbsDM, species, fatDM, fiberDM);

  return {
    carbs,
    dryMatter,
    carbsDM,
    proteinDM,
    fatDM,
    fiberDM,
    verdict,
    proteinOk: proteinDM >= t.proteinDMMin,
    fatOk: fatDM <= t.fatDMMax,
    fiberOk: t.fiberImportant && t.fiberDMMin != null ? fiberDM >= t.fiberDMMin : undefined,
  };
}
