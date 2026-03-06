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
  other: 1,
};

export interface SeverityResult {
  severity: SymptomSeverity;
  score: number;
  explanationKey: string;
}

export function calculateSeverity(types: SymptomType[]): SeverityResult {
  const score = types.reduce((sum, type) => sum + (SYMPTOM_WEIGHTS[type] ?? 1), 0);

  if (score >= 6) {
    return { severity: 'severe', score, explanationKey: 'symptoms.severityExplanation.severe' };
  }
  if (score >= 3) {
    return { severity: 'moderate', score, explanationKey: 'symptoms.severityExplanation.moderate' };
  }
  return { severity: 'mild', score, explanationKey: 'symptoms.severityExplanation.mild' };
}
