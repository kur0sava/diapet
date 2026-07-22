import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shared/theme';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';
import EmergencyScreen from '@features/emergency/screens/EmergencyScreen';
import PaywallScreen from '@features/subscription/screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

import { isAiFeatureVisible } from '@shared/config/runtimeConfig';
import { isAiConfigured } from '@features/hints/utils/aiClient';

// AiTab is only registered in MainNavigator when the AI feature is enabled —
// keeping a dead 'ai' deep link route would make diapet://ai throw a
// navigation warning against an unmounted screen. Both flags are build-static.
const aiTabAvailable = isAiFeatureVisible() && isAiConfigured();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['diapet://'],
  config: {
    screens: {
      Emergency: 'emergency',
      Paywall: 'paywall',
      Main: {
        screens: {
          Home: {
            screens: {
              Dashboard: '',
              LogGlucose: 'glucose/log',
              LogInjection: 'injection/log',
              LogFeeding: 'feeding/log',
              GlucoseList: 'glucose',
              DailyDiary: 'diary',
              AnalyzerDashboard: 'analyzer',
            },
          },
          ...(aiTabAvailable ? { AiTab: 'ai' } : {}),
          EncyclopediaTab: {
            screens: {
              ArticleList: 'articles',
              ArticleDetail: 'articles/:articleId',
            },
          },
        },
      },
    },
  },
};

export function RootNavigator() {
  const { theme } = useTheme();
  const isOnboardingComplete = storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE) ?? false;

  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
    fonts: {
      regular: { fontFamily: theme.fonts.regular, fontWeight: '400' as const },
      medium: { fontFamily: theme.fonts.medium, fontWeight: '500' as const },
      bold: { fontFamily: theme.fonts.bold, fontWeight: '700' as const },
      heavy: { fontFamily: theme.fonts.bold, fontWeight: '800' as const },
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} linking={linking}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isOnboardingComplete ? 'Main' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
