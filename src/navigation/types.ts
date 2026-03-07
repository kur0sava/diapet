import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Emergency: undefined;
  Paywall: { feature?: string } | undefined;
};

// Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  GlucoseTab: undefined;
  SymptomsTab: undefined;
  EncyclopediaTab: undefined;
  MoreTab: undefined;
};

// Home Stack
export type HomeStackParamList = {
  Dashboard: undefined;
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
};

// Onboarding Stack
export type OnboardingStackParamList = {
  Language: undefined;
  PetInfo: undefined;
  Schedule: { petData: any };
  VetContact: { petData: any; injectionTimes: string[]; feedingTimes: string[] };
  Notifications: { petData: any; injectionTimes: string[]; feedingTimes: string[]; vetName?: string; vetPhone?: string };
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
