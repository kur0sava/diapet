import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@shared/theme';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { RootNavigator } from '@navigation/RootNavigator';
import { usePetStore } from '@shared/stores/petStore';
import { initStorage } from '@storage/mmkv/storage';
import { restoreLanguage } from '@shared/i18n';
import '@shared/i18n';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import Purchases from 'react-native-purchases';
import { useSubscriptionStore } from '@shared/stores/subscriptionStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { theme } = useTheme();
  const loadPets = usePetStore(s => s.loadPets);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initStorage()
      .then(async () => {
        restoreLanguage();
        // Init RevenueCat — replace the key below with your real RevenueCat API key
        const REVENUECAT_API_KEY = 'YOUR_REVENUECAT_API_KEY';
        try {
          if (!REVENUECAT_API_KEY.startsWith('YOUR_')) {
            Purchases.configure({ apiKey: REVENUECAT_API_KEY });
            useSubscriptionStore.getState().loadStatus();
          } else {
            console.warn('RevenueCat: placeholder API key — subscription features disabled. Replace REVENUECAT_API_KEY in App.tsx.');
          }
        } catch (e) {
          console.error('RevenueCat init failed:', e);
        }
        setReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
        // C004: do not silently fall back to unencrypted MMKV — show error screen
        setStorageError(true);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (storageError) {
    return (
      <View style={styles.loading}>
        <Text style={{ textAlign: 'center', padding: 24, fontSize: 16 }}>
          {'Failed to initialize secure storage.\nPlease restart the app.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
