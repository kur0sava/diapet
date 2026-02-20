import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRootNavigation } from '@navigation/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
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
import MoreMenuScreen from '@features/pets/screens/MoreMenuScreen';
import PetProfileScreen from '@features/pets/screens/PetProfileScreen';
import EditPetScreen from '@features/pets/screens/EditPetScreen';
import ExpensesScreen from '@features/expenses/screens/ExpensesScreen';
import AddExpenseScreen from '@features/expenses/screens/AddExpenseScreen';
import SettingsScreen from '@features/pets/screens/SettingsScreen';

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
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="LogGlucose" component={LogGlucoseScreen} />
      <HomeStack.Screen name="LogInjection" component={LogInjectionScreen} />
      <HomeStack.Screen name="LogFeeding" component={LogFeedingScreen} />
      <HomeStack.Screen name="AddSymptom" component={AddSymptomScreen} />
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
      }}
    >
      <GlucoseStack.Screen name="GlucoseList" component={GlucoseListScreen} />
      <GlucoseStack.Screen name="LogGlucose" component={LogGlucoseScreen} />
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
      }}
    >
      <SymptomsStack.Screen name="SymptomsList" component={SymptomsListScreen} />
      <SymptomsStack.Screen name="AddSymptom" component={AddSymptomScreen} />
      <SymptomsStack.Screen name="SymptomDetail" component={SymptomDetailScreen} />
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
      }}
    >
      <EncyclopediaStack.Screen name="ArticleList" component={ArticleListScreen} />
      <EncyclopediaStack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
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
      }}
    >
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} options={{ headerShown: false }} />
      <MoreStack.Screen name="PetProfile" component={PetProfileScreen} />
      <MoreStack.Screen name="EditPet" component={EditPetScreen} />
      <MoreStack.Screen name="Expenses" component={ExpensesScreen} />
      <MoreStack.Screen name="AddExpense" component={AddExpenseScreen} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
    </MoreStack.Navigator>
  );
}

// Emergency FAB Button
function EmergencyButton() {
  const navigation = useRootNavigation();
  return (
    <TouchableOpacity
      style={styles.emergencyButton}
      onPress={() => navigation.navigate('Emergency')}
      activeOpacity={0.8}
    >
      <Ionicons name="warning" size={20} color="#fff" />
    </TouchableOpacity>
  );
}

export default function MainNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 60,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, string> = {
              Home: focused ? 'home' : 'home-outline',
              GlucoseTab: focused ? 'water' : 'water-outline',
              SymptomsTab: focused ? 'paw' : 'paw-outline',
              EncyclopediaTab: focused ? 'book' : 'book-outline',
              MoreTab: focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline',
            };
            return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
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
  emergencyButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
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
    zIndex: 1000,
  },
});
