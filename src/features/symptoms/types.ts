export {
  SymptomType,
  SymptomSeverity,
  SymptomEntry,
  CreateSymptomDTO,
} from '@storage/domain/types';

// Feature-specific UI constants stay here
import type { SymptomType } from '@storage/domain/types';
import type { IoniconName } from '@shared/components/ui';

export const SYMPTOM_ICONS: Record<SymptomType, IoniconName> = {
  hindLimbWeakness: 'walk-outline',
  weightLoss: 'trending-down-outline',
  polyuria: 'water-outline',
  polydipsia: 'cafe-outline',
  lossOfAppetite: 'restaurant-outline',
  behavioralChanges: 'paw-outline',
  lethargy: 'bed-outline',
  vomiting: 'alert-circle-outline',
  diarrhea: 'warning-outline',
  cataracts: 'eye-outline',
  urinaryInfection: 'medkit-outline',
  panting: 'fitness-outline',
  ataxia: 'accessibility-outline',
  other: 'help-circle-outline',
};

export const SYMPTOM_COLORS: Record<SymptomType, string> = {
  hindLimbWeakness: '#FF9500',
  weightLoss: '#FF3B30',
  polyuria: '#007AFF',
  polydipsia: '#5AC8FA',
  lossOfAppetite: '#FF9500',
  behavioralChanges: '#AF52DE',
  lethargy: '#8E8E93',
  vomiting: '#FF3B30',
  diarrhea: '#FF9500',
  cataracts: '#5856D6',
  urinaryInfection: '#FF2D55',
  panting: '#FF9500',
  ataxia: '#FF3B30',
  other: '#8E8E93',
};
