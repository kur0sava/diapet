import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
} from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@shared/theme';
import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { RootNavigator } from '@navigation/RootNavigator';
import { HintProvider } from '@features/hints/components/HintProvider';
import { useMorningGreeting } from '@features/hints/hooks/useMorningGreeting';
import { useMissedInjection } from '@features/hints/hooks/useMissedInjection';
import { scheduleHintPushNotifications } from '@features/hints/utils/hintScheduler';
import { restoreScheduleNotifications } from '@shared/hooks/useNotifications';
import { usePetStore } from '@shared/stores/petStore';
import { initStorage, storage, StorageKeys } from '@storage/mmkv/storage';
import { petRepository } from '@storage/database';
import i18n, { restoreLanguage } from '@shared/i18n';
import '@shared/i18n';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import * as SplashScreen from 'expo-splash-screen';
import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { getDeviceId } from '@shared/utils/deviceId';
import { configureGoogleSignIn } from '@features/auth/utils/googleAuth';
import { useAuthStore } from '@features/auth/stores/authStore';

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

  useMorningGreeting();
  useMissedInjection();

  useEffect(() => {
    // Initial restore on mount
    restoreScheduleNotifications().catch(() => {});
    scheduleHintPushNotifications().catch(() => {});

    // Re-register on every foreground return — Android may silently drop
    // scheduled alarms after Doze, battery optimization, or app updates
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        useSubscriptionStore.getState().refreshStatus();
        restoreScheduleNotifications().catch(() => {});
      }
    });
    return () => sub.remove();
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
  const [storageError, setStorageError] = useState(false);
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  useEffect(() => {
    initStorage()
      .then(async () => {
        restoreLanguage();
        // Fallback: set hints registration date for existing users who completed onboarding
        // before the hints system was introduced
        if (
          storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE) &&
          !storage.getString(StorageKeys.HINTS_REGISTRATION_DATE)
        ) {
          storage.set(StorageKeys.HINTS_REGISTRATION_DATE, new Date().toISOString());
        }
        // Recovery: if onboarding was never completed but pets exist in DB,
        // the previous install crashed mid-onboarding. Purge orphaned pets so
        // the re-run of onboarding doesn't leave duplicates behind.
        if (!storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE)) {
          try {
            const existing = await petRepository.findActive();
            for (const p of existing) await petRepository.delete(p.id);
          } catch {
            /* best-effort recovery */
          }
        }
        // Init device ID + check subscription status via Supabase
        getDeviceId();
        useSubscriptionStore.getState().loadStatus();
        // Configure Google Sign-In and restore session
        configureGoogleSignIn();
        useAuthStore.getState().restoreSession();
        setReady(true);
      })
      .catch(err => {
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
        <Text style={{ textAlign: 'center', padding: 24, fontSize: 16, color: '#333' }}>
          {i18n.t('errors.storageError')}
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: '#D42020',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          onPress={() => {
            setStorageError(false);
            initStorage()
              .then(() => setReady(true))
              .catch(() => setStorageError(true));
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
            {i18n.t('errors.storageRetry')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider>
            <HintProvider>
              <AppContent />
            </HintProvider>
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
