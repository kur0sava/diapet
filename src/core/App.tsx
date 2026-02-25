import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
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
  }, []);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initStorage()
      .then(() => {
        restoreLanguage();
        setReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize storage:', err);
        setReady(true);
      });
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (ready && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutReady}>
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
