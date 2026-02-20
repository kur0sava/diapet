import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import LanguageScreen from '@features/onboarding/screens/LanguageScreen';
import PetInfoScreen from '@features/onboarding/screens/PetInfoScreen';
import ScheduleScreen from '@features/onboarding/screens/ScheduleScreen';
import VetContactScreen from '@features/onboarding/screens/VetContactScreen';
import NotificationsScreen from '@features/onboarding/screens/NotificationsScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="PetInfo" component={PetInfoScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="VetContact" component={VetContactScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
