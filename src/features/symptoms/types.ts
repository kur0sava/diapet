export {
  SymptomType,
  SymptomSeverity,
  SymptomEntry,
  CreateSymptomDTO,
} from '@storage/domain/types';

// Feature-specific UI constants stay here
import type { SymptomType } from '@storage/domain/types';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IonIconName = ComponentProps<typeof Ionicons>['name'];

export const SYMPTOM_ICONS: Record<SymptomType, IonIconName> = {
  hindLimbWeakness: 'walk-outline',
  weightLoss: 'trending-down-outline',
  polyuria: 'water-outline',
  polydipsia: 'cafe-outline',
  lossOfAppetite: 'restaurant-outline',
  behavioralChanges: 'paw-outline',
  lethargy: 'bed-outline',
  vomiting: 'alert-circle-outline',
  diarrhea: 'warning-outline',
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
  other: '#8E8E93',
};
