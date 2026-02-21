import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@shared/theme';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { RootStackParamList } from './types';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';
import EmergencyScreen from '@features/emergency/screens/EmergencyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <NavigationContainer theme={navigationTheme}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
