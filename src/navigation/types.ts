import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Onboarding pet data passed between onboarding screens
export type OnboardingPetData = {
  name: string;
  gender: 'male' | 'female';
  weightKg?: number;
  birthYear?: number;
  diabetesType: 'type1' | 'type2' | 'unknown';
  diagnosisDate?: string;
};

// Root Stack
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Emergency: undefined;
  Paywall: { feature?: string } | undefined;
};

// Tab Navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  GlucoseTab: NavigatorScreenParams<GlucoseStackParamList> | undefined;
  SymptomsTab: NavigatorScreenParams<SymptomsStackParamList> | undefined;
  EncyclopediaTab: NavigatorScreenParams<EncyclopediaStackParamList> | undefined;
  MoreTab: NavigatorScreenParams<MoreStackParamList> | undefined;
};

// Home Stack
export type HomeStackParamList = {
  Dashboard: undefined;
  DailyDiary: { date?: string };
  LogGlucose: { editId?: string };
  LogInjection: undefined;
  LogFeeding: undefined;
  AddSymptom: { editId?: string; glucoseReadingId?: string };
  InjectionList: undefined;
  FeedingList: undefined;
  FeedGuide: undefined;
  FeedGuideRegion: { region: string };
  FeedGuideAlternatives: undefined;
  FeedGuideNatural: undefined;
};

// Glucose Stack
export type GlucoseStackParamList = {
  GlucoseList: undefined;
  LogGlucose: { editId?: string };
};

// Symptoms Stack
export type SymptomsStackParamList = {
  SymptomsList: undefined;
  SymptomDetail: { id: string };
  AddSymptom: { editId?: string; glucoseReadingId?: string };
  Assessment: undefined;
};

// Encyclopedia Stack
export type EncyclopediaStackParamList = {
  ArticleList: undefined;
  ArticleDetail: { articleId: string };
  FeedGuide: undefined;
  FeedGuideRegion: { region: string };
  FeedGuideAlternatives: undefined;
  FeedGuideNatural: undefined;
};

// More Stack
export type MoreStackParamList = {
  MoreMenu: undefined;
  PetProfile: undefined;
  EditPet: undefined;
  Expenses: undefined;
  AddExpense: { editId?: string };
  Settings: undefined;
  FeedCalculator: undefined;
  Subscription: undefined;
  AiAssistant: undefined;
};

// Onboarding Stack
export type OnboardingStackParamList = {
  Language: undefined;
  PetInfo: undefined;
  Schedule: { petData: OnboardingPetData };
  VetContact: { petData: OnboardingPetData; injectionTimes: string[]; feedingTimes: string[] };
  Notifications: { petData: OnboardingPetData; injectionTimes: string[]; feedingTimes: string[]; vetName?: string; vetPhone?: string };
};

// Screen props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type GlucoseStackScreenProps<T extends keyof GlucoseStackParamList> =
  NativeStackScreenProps<GlucoseStackParamList, T>;

export type SymptomsStackScreenProps<T extends keyof SymptomsStackParamList> =
  NativeStackScreenProps<SymptomsStackParamList, T>;

export type EncyclopediaStackScreenProps<T extends keyof EncyclopediaStackParamList> =
  NativeStackScreenProps<EncyclopediaStackParamList, T>;

export type MoreStackScreenProps<T extends keyof MoreStackParamList> =
  NativeStackScreenProps<MoreStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
