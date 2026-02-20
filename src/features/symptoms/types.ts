export {
  SymptomType,
  SymptomSeverity,
  SymptomEntry,
  CreateSymptomDTO,
} from '@storage/domain/types';

// Feature-specific UI constants stay here
import type { SymptomType } from '@storage/domain/types';

export const SYMPTOM_ICONS: Record<SymptomType, string> = {
  hindLimbWeakness: '🦵',
  weightLoss: '⚖️',
  polyuria: '💧',
  polydipsia: '🥤',
  lossOfAppetite: '🍽️',
  behavioralChanges: '🐾',
  lethargy: '😴',
  vomiting: '🤢',
  diarrhea: '⚠️',
  other: '❓',
};
