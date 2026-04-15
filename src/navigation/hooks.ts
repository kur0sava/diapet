import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  RootStackParamList,
  HomeStackParamList,
  SymptomsStackParamList,
  EncyclopediaStackParamList,
  MoreStackParamList,
  OnboardingStackParamList,
} from './types';

export const useRootNavigation = () =>
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();

export const useHomeNavigation = () =>
  useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

export const useSymptomsNavigation = () =>
  useNavigation<NativeStackNavigationProp<SymptomsStackParamList>>();

export const useEncyclopediaNavigation = () =>
  useNavigation<NativeStackNavigationProp<EncyclopediaStackParamList>>();

export const useMoreNavigation = () =>
  useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

export const useOnboardingNavigation = () =>
  useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();
