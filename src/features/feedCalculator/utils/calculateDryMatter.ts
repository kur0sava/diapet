export interface MacroInput {
  protein: number;
  fat: number;
  fiber: number;
  ash: number;
  moisture: number;
}

export interface DryMatterResult {
  carbs: number;
  dryMatter: number;
  carbsDM: number;
  proteinDM: number;
  fatDM: number;
  verdict: 'good' | 'acceptable' | 'bad';
  proteinOk: boolean;
  fatOk: boolean;
}

export function calculateDryMatter(input: MacroInput): DryMatterResult | null {
  const { protein, fat, fiber, ash, moisture } = input;
  const total = protein + fat + fiber + ash + moisture;

  if (total > 100) return null;

  const dryMatter = 100 - moisture;
  if (dryMatter <= 0) return null;

  const carbs = 100 - protein - fat - fiber - ash - moisture;
  const carbsDM = (carbs / dryMatter) * 100;
  const proteinDM = (protein / dryMatter) * 100;
  const fatDM = (fat / dryMatter) * 100;

  let verdict: DryMatterResult['verdict'];
  if (carbsDM < 10) {
    verdict = 'good';
  } else if (carbsDM <= 15) {
    verdict = 'acceptable';
  } else {
    verdict = 'bad';
  }

  return {
    carbs,
    dryMatter,
    carbsDM,
    proteinDM,
    fatDM,
    verdict,
    proteinOk: proteinDM >= 40,
    fatOk: fatDM <= 40, // MH005: ISFM fat upper limit 40% DM (was 45)
  };
}
