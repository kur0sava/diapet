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
import { refreshWeeklySummaryPush } from '@features/dashboard/utils/weeklySummaryScheduler';
import { restoreScheduleNotifications } from '@shared/hooks/useNotifications';
import { usePetStore } from '@shared/stores/petStore';
import { initStorage, storage, StorageKeys, vetNameKey, vetPhoneKey } from '@storage/mmkv/storage';
import { runStartupRecovery } from '@core/startupRecovery';
import { initRegionOnFirstRun } from '@shared/config/regionConfig';
import { refreshFoodCatalog } from '@features/encyclopedia/data/foodCatalog';
import i18n, { restoreLanguage } from '@shared/i18n';
import '@shared/i18n';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';
import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { getDeviceId } from '@shared/utils/deviceId';
import { configureGoogleSignIn } from '@features/auth/utils/googleAuth';
import { useAuthStore } from '@features/auth/stores/authStore';
import { initAnalytics, setUserProperty } from '@shared/analytics/analytics';
import { getPremiumMode } from '@shared/config/runtimeConfig';

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
    // Weekly summary push: recompute stats and (re)schedule for next Sunday
    refreshWeeklySummaryPush().catch(() => {});
    // Self-updating food catalog: background pull, throttled to 1/day,
    // silent on any failure (bundled/cached data keeps serving).
    refreshFoodCatalog().catch(() => {});

    // Re-register on every foreground return — Android may silently drop
    // scheduled alarms after Doze, battery optimization, or app updates
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        useSubscriptionStore.getState().refreshStatus();
        restoreScheduleNotifications().catch(() => {});
        refreshWeeklySummaryPush().catch(() => {});
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
  });

  // Full startup sequence — shared by the mount effect AND the storage-error
  // retry button. Previously retry only re-ran initStorage() and skipped
  // language restore / subscription / auth / analytics, booting a half-
  // initialized app.
  const bootstrap = async () => {
    await initStorage();
    restoreLanguage();
    // Region profile: detect from device locale on first launch; on a fresh
    // install also derive default language / glucose unit (never overrides
    // choices the user already made).
    initRegionOnFirstRun();
    // Fallback: set hints registration date for existing users who completed onboarding
    // before the hints system was introduced
    if (
      storage.getBoolean(StorageKeys.ONBOARDING_COMPLETE) &&
      !storage.getString(StorageKeys.HINTS_REGISTRATION_DATE)
    ) {
      storage.set(StorageKeys.HINTS_REGISTRATION_DATE, new Date().toISOString());
    }
    // BUG-C001: if onboarding looks incomplete, either purge onboarding
    // orphans or ADOPT a restored database (device migration loses the MMKV
    // encryption key but not the SQLite DB). See startupRecovery.ts.
    await runStartupRecovery();
    // v2.5.1: migrate legacy global vet contact to per-pet keys.
    // Pre-2.5.1 single-pet installs stored vetName/vetPhone globally; with
    // dog support arriving and multi-pet plausible, attribute the legacy
    // values to the active pet, then drop the globals so subsequent edits
    // can't fight migration.
    try {
      const legacyName = storage.getString(StorageKeys.VET_NAME);
      const legacyPhone = storage.getString(StorageKeys.VET_PHONE);
      if (legacyName !== undefined || legacyPhone !== undefined) {
        const activePetId = storage.getString(StorageKeys.ACTIVE_PET_ID);
        if (activePetId) {
          if (legacyName !== undefined && !storage.contains(vetNameKey(activePetId))) {
            storage.set(vetNameKey(activePetId), legacyName);
          }
          if (legacyPhone !== undefined && !storage.contains(vetPhoneKey(activePetId))) {
            storage.set(vetPhoneKey(activePetId), legacyPhone);
          }
          storage.delete(StorageKeys.VET_NAME);
          storage.delete(StorageKeys.VET_PHONE);
        }
      }
    } catch {
      /* best-effort: stale legacy keys harmless until next launch */
    }
    // Init device ID + check subscription status via Supabase
    getDeviceId();
    useSubscriptionStore.getState().loadStatus();
    // Configure Google Sign-In and restore session
    configureGoogleSignIn();
    useAuthStore.getState().restoreSession();
    // Analytics — respects opt-out flag, auto-tracks app_open / first_open
    initAnalytics().catch(() => {});
    setUserProperty('premium_mode', getPremiumMode());
    setReady(true);
  };

  useEffect(() => {
    bootstrap().catch(err => {
      console.error('Failed to initialize storage:', err);
      // C004: do not silently fall back to unencrypted MMKV — show error screen
      setStorageError(true);
      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setReady(false);
            bootstrap().catch(() => {
              setStorageError(true);
              setReady(true);
            });
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
    // Явный светлый фон: этот экран показывается ДО темы (загрузка/фатальная
    // ошибка хранилища). Без фона он прозрачный, и на устройстве в тёмной теме
    // тёмный текст ошибки '#333' и спиннер становились почти невидимы.
    backgroundColor: '#FFFFFF',
  },
});
