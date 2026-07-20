import { SymptomType, SymptomSeverity } from '../types';

const SYMPTOM_WEIGHTS: Record<SymptomType, number> = {
  hindLimbWeakness: 2,
  weightLoss: 2,
  polyuria: 2,
  polydipsia: 2,
  lossOfAppetite: 2,
  behavioralChanges: 1,
  lethargy: 2,
  vomiting: 3,
  diarrhea: 2,
  cataracts: 2,
  urinaryInfection: 2,
  panting: 1,
  ataxia: 3,
  other: 1,
};

export interface SeverityResult {
  severity: SymptomSeverity;
  score: number;
  explanationKey: string;
}

/**
 * DKA red-flag combo (MC012, diapet-medical-auditor Батч8).
 *
 * dka.ts / dog-dka.ts explicitly list "vomiting + refusal to eat" as a
 * "go to the clinic IMMEDIATELY" combo, and separately say "2 or more of
 * these signs [vomiting, complete anorexia, severe lethargy, acetone
 * breath, rapid breathing, dehydration] — act immediately". Before this
 * fix, the plain weighted sum let vomiting(3) + lossOfAppetite(2) = 5 land
 * on 'moderate' — silently contradicting the app's own DKA guidance. This
 * mirrors the hasRedFlag() override already used by the Assessment
 * questionnaire (features/assessment/utils/scoring.ts) so the two
 * symptom-severity surfaces in the app don't disagree on the same picture.
 */
function hasDkaRedFlag(types: SymptomType[]): boolean {
  const has = (t: SymptomType) => types.includes(t);
  if (has('vomiting') && has('lossOfAppetite')) return true;
  if (has('vomiting') && has('lethargy')) return true;
  return false;
}

export function calculateSeverity(types: SymptomType[]): SeverityResult {
  const score = types.reduce((sum, type) => sum + (SYMPTOM_WEIGHTS[type] ?? 1), 0);

  if (hasDkaRedFlag(types) || score >= 6) {
    return { severity: 'severe', score, explanationKey: 'symptoms.severityExplanation.severe' };
  }
  if (score >= 3) {
    return { severity: 'moderate', score, explanationKey: 'symptoms.severityExplanation.moderate' };
  }
  return { severity: 'mild', score, explanationKey: 'symptoms.severityExplanation.mild' };
}
