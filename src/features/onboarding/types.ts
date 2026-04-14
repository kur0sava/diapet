export interface OnboardingState {
  step: number;
  totalSteps: number;
  language: 'ru' | 'en';
  petSpecies: import('@storage/domain/types').PetSpecies;
  petName: string;
  petGender: 'male' | 'female' | 'unknown';
  petBirthYear?: number;
  petWeightKg?: number;
  diagnosisDate?: string;
  diabetesType: 'type1' | 'type2' | 'unknown';
  insulinType?: string;
  injectionTimes: string[];
  feedingTimes: string[];
  vetName?: string;
  vetPhone?: string;
  notificationsEnabled: boolean;
}
