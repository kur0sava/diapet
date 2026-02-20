export interface OnboardingState {
  step: number;
  totalSteps: number;
  language: 'ru' | 'en';
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
