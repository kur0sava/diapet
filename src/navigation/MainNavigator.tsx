import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRootNavigation } from '@navigation/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { MainTabParamList } from './types';

// Screens
import DashboardScreen from '@features/dashboard/screens/DashboardScreen';
import LogGlucoseScreen from '@features/glucose/screens/LogGlucoseScreen';
import LogInjectionScreen from '@features/glucose/screens/LogInjectionScreen';
import LogFeedingScreen from '@features/glucose/screens/LogFeedingScreen';
import GlucoseListScreen from '@features/glucose/screens/GlucoseListScreen';
import SymptomsListScreen from '@features/symptoms/screens/SymptomsListScreen';
import AddSymptomScreen from '@features/symptoms/screens/AddSymptomScreen';
import SymptomDetailScreen from '@features/symptoms/screens/SymptomDetailScreen';
import ArticleListScreen from '@features/encyclopedia/screens/ArticleListScreen';
import ArticleDetailScreen from '@features/encyclopedia/screens/ArticleDetailScreen';
import FeedGuideScreen from '@features/encyclopedia/screens/FeedGuideScreen';
import FeedGuideRegionScreen from '@features/encyclopedia/screens/FeedGuideRegionScreen';
import FeedGuideAlternativesScreen from '@features/encyclopedia/screens/FeedGuideAlternativesScreen';
import FeedGuideNaturalScreen from '@features/encyclopedia/screens/FeedGuideNaturalScreen';
import MoreMenuScreen from '@features/pets/screens/MoreMenuScreen';
import PetProfileScreen from '@features/pets/screens/PetProfileScreen';
import EditPetScreen from '@features/pets/screens/EditPetScreen';
import ExpensesScreen from '@features/expenses/screens/ExpensesScreen';
import AddExpenseScreen from '@features/expenses/screens/AddExpenseScreen';
import SettingsScreen from '@features/pets/screens/SettingsScreen';
import AssessmentScreen from '@features/assessment/screens/AssessmentScreen';
import FeedCalculatorScreen from '@features/feedCalculator/screens/FeedCalculatorScreen';
import InjectionListScreen from '@features/glucose/screens/InjectionListScreen';
import FeedingListScreen from '@features/glucose/screens/FeedingListScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Stack navigators for each tab
const HomeStack = createNativeStackNavigator();
const GlucoseStack = createNativeStackNavigator();
const SymptomsStack = createNativeStackNavigator();
const EncyclopediaStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

function HomeStackNavigator() {
  const { theme } = useTheme();
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="LogGlucose" component={LogGlucoseScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="LogInjection" component={LogInjectionScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="LogFeeding" component={LogFeedingScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="AddSymptom" component={AddSymptomScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="InjectionList" component={InjectionListScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="FeedingList" component={FeedingListScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function GlucoseStackNavigator() {
  const { theme } = useTheme();
  return (
    <GlucoseStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <GlucoseStack.Screen name="GlucoseList" component={GlucoseListScreen} options={{ headerShown: false }} />
      <GlucoseStack.Screen name="LogGlucose" component={LogGlucoseScreen} options={{ headerShown: false }} />
    </GlucoseStack.Navigator>
  );
}

function SymptomsStackNavigator() {
  const { theme } = useTheme();
  return (
    <SymptomsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <SymptomsStack.Screen name="SymptomsList" component={SymptomsListScreen} options={{ headerShown: false }} />
      <SymptomsStack.Screen name="AddSymptom" component={AddSymptomScreen} options={{ headerShown: false }} />
      <SymptomsStack.Screen name="SymptomDetail" component={SymptomDetailScreen} options={{ headerShown: false }} />
    </SymptomsStack.Navigator>
  );
}

function EncyclopediaStackNavigator() {
  const { theme } = useTheme();
  return (
    <EncyclopediaStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <EncyclopediaStack.Screen name="ArticleList" component={ArticleListScreen} options={{ headerShown: false }} />
      <EncyclopediaStack.Screen name="ArticleDetail" component={ArticleDetailScreen} options={{ headerShown: false }} />
      <EncyclopediaStack.Screen name="FeedGuide" component={FeedGuideScreen} options={{ headerShown: false }} />
      <EncyclopediaStack.Screen name="FeedGuideRegion" component={FeedGuideRegionScreen} options={{ headerShown: false }} />
      <EncyclopediaStack.Screen name="FeedGuideAlternatives" component={FeedGuideAlternativesScreen} options={{ headerShown: false }} />
      <EncyclopediaStack.Screen name="FeedGuideNatural" component={FeedGuideNaturalScreen} options={{ headerShown: false }} />
    </EncyclopediaStack.Navigator>
  );
}

function MoreStackNavigator() {
  const { theme } = useTheme();
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.header },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="PetProfile" component={PetProfileScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="EditPet" component={EditPetScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="AddExpense" component={AddExpenseScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="Assessment" component={AssessmentScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="FeedCalculator" component={FeedCalculatorScreen} options={{ headerShown: false }} />
    </MoreStack.Navigator>
  );
}

// Emergency FAB Button
function EmergencyButton() {
  const navigation = useRootNavigation();
  const insets = useSafeAreaInsets();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withSequence(
      withTiming(1.08, { duration: 1000 }),
      withTiming(1.0, { duration: 1000 }),
    ), -1, true) }],
  }));

  return (
    <Animated.View style={[styles.emergencyButtonWrapper, { bottom: 72 + Math.max(insets.bottom, 8) }, pulseStyle]}>
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate('Emergency')}
        activeOpacity={0.8}
      >
        <Ionicons name="warning" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MainNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 64 + Math.max(insets.bottom, 8),
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            fontFamily: 'Inter_500Medium',
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, string> = {
              Home: focused ? 'home' : 'home-outline',
              GlucoseTab: focused ? 'water' : 'water-outline',
              SymptomsTab: focused ? 'paw' : 'paw-outline',
              EncyclopediaTab: focused ? 'book' : 'book-outline',
              MoreTab: focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline',
            };
            return (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name={icons[route.name] as any} size={size} color={color} />
                {focused && (
                  <View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary,
                    marginTop: 3,
                  }} />
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: t('navigation.home') }} />
        <Tab.Screen name="GlucoseTab" component={GlucoseStackNavigator} options={{ title: t('navigation.glucose') }} />
        <Tab.Screen name="SymptomsTab" component={SymptomsStackNavigator} options={{ title: t('navigation.symptoms') }} />
        <Tab.Screen name="EncyclopediaTab" component={EncyclopediaStackNavigator} options={{ title: t('navigation.encyclopedia') }} />
        <Tab.Screen name="MoreTab" component={MoreStackNavigator} options={{ title: t('navigation.more') }} />
      </Tab.Navigator>
      <EmergencyButton />
    </>
  );
}

const styles = StyleSheet.create({
  emergencyButtonWrapper: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000,
  },
  emergencyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
