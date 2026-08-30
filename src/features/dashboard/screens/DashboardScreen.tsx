import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ToastAndroid,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useHomeNavigation, useRootNavigation } from '@navigation/hooks';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { glucoseRepository, injectionRepository, scheduleRepository } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { GlucoseUnit } from '@storage/domain/types';
import { Card } from '@shared/components/ui';
import { GlucoseChart } from '../components/GlucoseChart';
import { StatusCard } from '../components/StatusCard';
import { GlucoseHeroCard } from '../components/GlucoseHeroCard';
import { QuickActionButton } from '../components/QuickActionButton';
import { FirstStepsCard } from '../components/FirstStepsCard';
import { formatRelative, minutesUntil, formatCountdown, hoursSince } from '@shared/utils/dateUtils';
import {
  getGlucoseColorFromRanges,
  getGlucoseArrowFromRanges,
  getGlucoseLevelFromRanges,
} from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { Icon } from '@shared/components/ui/Icon';
import { PetAvatar } from '@shared/components/ui/PetAvatar';
import { usePetStore } from '@shared/stores/petStore';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { TRIAL_REMINDER_DAYS } from '@features/subscription/utils/trial';
import { useFocusEffect } from '@react-navigation/native';
import { useAnalyzer } from '@features/analyzer/hooks/useAnalyzer';
import { computeStreakDays } from '@features/hints/utils/achievementEngine';
import { computeWeeklySummary } from '../utils/weeklySummary';
import { mmolToMgdl } from '@storage/domain/types';
import { RiskScoreWidget } from '@features/analyzer/components/RiskScoreWidget';
import { TrendIndicator } from '@features/analyzer/components/TrendIndicator';
import { SmartInsightCard } from '@features/analyzer/components/SmartInsightCard';
import { PetPickerSheet } from '@features/pets/components/PetPickerSheet';
import { Alert } from 'react-native';
import type { Pet } from '@storage/domain/types';

interface GlucoseReading {
  valueMmol: number;
  recordedAt: string;
}

function calculateTrend(readings: GlucoseReading[]): 'up' | 'down' | 'stable' | null {
  if (!readings || readings.length < 3) return null;
  const last3 = readings.slice(-3); // Last 3 = newest (sorted ASC)
  const [a, b, c] = last3.map(r => r.valueMmol);
  if (a < b && b < c) return 'up';
  if (a > b && b > c) return 'down';
  const avg = (a + b + c) / 3;
  const maxDev = Math.max(Math.abs(a - avg), Math.abs(b - avg), Math.abs(c - avg));
  return maxDev / avg < 0.15 ? 'stable' : null;
}

function getTrendArrow(trend: 'up' | 'down' | 'stable' | null): string {
  switch (trend) {
    case 'up':
      return ' \u2191';
    case 'down':
      return ' \u2193';
    case 'stable':
      return ' \u2192';
    default:
      return '';
  }
}

function getTrendLabel(trend: 'up' | 'down' | 'stable' | null, t: (key: string) => string): string {
  switch (trend) {
    case 'up':
      return t('dashboard.trendUp');
    case 'down':
      return t('dashboard.trendDown');
    case 'stable':
      return t('dashboard.trendStable');
    default:
      return '';
  }
}

export default function DashboardScreen() {
  const navigation = useHomeNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const pets = usePetStore(s => s.pets);
  const setActivePet = usePetStore(s => s.setActivePet);
  const speciesConfig = getSpeciesConfig(activePet?.species ?? 'cat');
  const speciesRanges = speciesConfig.glucose.ranges;
  const { isPro, isPaidPro, isTrialActive, trialDaysLeft, canAddPet, isMonetizationEnabled } =
    useSubscription();
  const [pickerVisible, setPickerVisible] = useState(false);
  const hasMultiplePets = pets.length > 1;
  // Plain functions: React Compiler memoizes them. Manual useCallback would
  // require deps that include setPickerVisible (a setter), which is stable
  // but the compiler's preserve-manual-memoization rule rejects the mismatch.
  const handleSelectPet = (pet: Pet) => {
    setActivePet(pet);
    setPickerVisible(false);
  };
  // Open the picker whenever there is a pet: with one pet the sheet still
  // exposes the "Add pet" row, which is the ONLY reachable path to AddPet.
  // Gating this behind hasMultiplePets used to strand single-pet users with
  // no way to add a second pet (the MoreMenu card had the same dead-end).
  const handleOpenPicker = () => {
    if (pets.length > 0) {
      setPickerVisible(true);
      return;
    }
    // Zero pets is reachable since onboarding can be skipped to browse the
    // encyclopedia. The picker sheet — the usual route to AddPet — renders
    // nothing useful with an empty list, so go straight there instead of
    // leaving the header tap dead.
    handleAddPetFromPicker();
  };
  const handleAddPetFromPicker = () => {
    setPickerVisible(false);
    if (!canAddPet(pets.length)) {
      if (isMonetizationEnabled) {
        Alert.alert(t('subscription.title'), t('pets.addPetGated'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('subscription.upgrade'), onPress: () => rootNavigation.navigate('Paywall') },
        ]);
      } else {
        Alert.alert(t('common.info'), t('subscription.notAvailable'));
      }
      return;
    }
    rootNavigation.navigate('Main', {
      screen: 'MoreTab',
      params: { screen: 'AddPet' },
    });
  };
  const showTrialBanner = isMonetizationEnabled && isTrialActive && !isPaidPro;
  const trialUrgent = showTrialBanner && trialDaysLeft <= TRIAL_REMINDER_DAYS;
  const petId = activePet?.id ?? '';
  // H004: respect the user's glucose unit preference
  const [glucoseUnit, setGlucoseUnit] = useState(
    () => (storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L') as GlucoseUnit
  );
  const queryClient = useQueryClient();
  const toggleGlucoseUnit = useCallback(() => {
    const next: GlucoseUnit = glucoseUnit === 'mmol/L' ? 'mg/dL' : 'mmol/L';
    storage.set(StorageKeys.GLUCOSE_UNIT, next);
    setGlucoseUnit(next);
    queryClient.invalidateQueries({ queryKey: queryKeys.glucose.all });
    // 5.6 (audit): the silent swap-chip flips the unit globally — give feedback
    // (haptics + toast) so the change isn't invisible, matching Settings.
    Haptics.selectionAsync().catch(() => {});
    if (Platform.OS === 'android') {
      ToastAndroid.show(t('settings.unitChanged', { unit: next }), ToastAndroid.SHORT);
    }
  }, [glucoseUnit, queryClient, t]);

  const { data: latestGlucose, refetch: refetchGlucose } = useQuery({
    queryKey: queryKeys.glucose.latest(petId),
    queryFn: () => glucoseRepository.findLatest(petId),
    enabled: !!petId,
  });

  const { data: glucoseHistory, refetch: refetchHistory } = useQuery({
    queryKey: queryKeys.glucose.days7(petId),
    queryFn: () => glucoseRepository.findLast7Days(petId),
    enabled: !!petId,
  });

  const { data: lastInjection, refetch: refetchLastInjection } = useQuery({
    queryKey: queryKeys.injections.latest(petId),
    queryFn: () => injectionRepository.findLatest(petId),
    enabled: !!petId,
  });

  const { data: injectionTimes, refetch: refetchInjectionTimes } = useQuery({
    queryKey: queryKeys.schedule.injections(petId),
    queryFn: () => scheduleRepository.getInjectionTimes(petId),
    enabled: !!petId,
  });

  const { data: feedingTimes, refetch: refetchFeedingTimes } = useQuery({
    queryKey: queryKeys.schedule.feedings(petId),
    queryFn: () => scheduleRepository.getFeedingTimes(petId),
    enabled: !!petId,
  });

  // v2.6 (3.3): logging streak — consecutive days with at least one record
  const { data: streakDays = 0, refetch: refetchStreak } = useQuery({
    queryKey: ['streak', petId],
    queryFn: () => computeStreakDays(petId),
    enabled: !!petId,
  });

  const {
    trends: analyzerTrends,
    riskScore,
    smartAlert,
    emergencyAlerts,
    hasEnoughData: hasAnalyzerData,
    readings: analyzerReadings,
  } = useAnalyzer();

  // v2.6 (3.2): rolling weekly summary vs previous week. Plain call —
  // React Compiler memoizes it; manual useMemo can't hold speciesConfig
  // (derived, non-memoized) as a dependency.
  const weeklySummary = computeWeeklySummary(analyzerReadings, speciesConfig);

  const [refreshing, setRefreshing] = React.useState(false);

  // C3 (audit): the emergency banner used to be undismissable and lingered for
  // the whole 24h alert window → alarm fatigue. Let the user acknowledge it;
  // a genuinely NEWER emergency (later recordedAt) re-shows it.
  const dismissKey = petId ? `emergencyDismissedAt_${petId}` : '';
  // audit L5: seed from storage on the very first render (lazy initializer) so an
  // already-dismissed banner doesn't flash for one frame before the effect runs.
  const [emergencyDismissedAt, setEmergencyDismissedAt] = React.useState(() =>
    dismissKey ? (storage.getString(dismissKey) ?? '') : ''
  );
  React.useEffect(() => {
    setEmergencyDismissedAt(dismissKey ? (storage.getString(dismissKey) ?? '') : '');
  }, [dismissKey]);
  const latestAlertAt = React.useMemo(
    () => emergencyAlerts.reduce((m, a) => (a.recordedAt > m ? a.recordedAt : m), ''),
    [emergencyAlerts]
  );
  const showEmergency = emergencyAlerts.length > 0 && latestAlertAt > emergencyDismissedAt;
  const dismissEmergency = React.useCallback(() => {
    if (dismissKey && latestAlertAt) {
      storage.set(dismissKey, latestAlertAt);
      setEmergencyDismissedAt(latestAlertAt);
    }
  }, [dismissKey, latestAlertAt]);

  // Refetch data when tab gains focus. Also re-read the glucose unit — it can
  // change in Settings or inside LogGlucoseScreen while this screen stays
  // mounted in the tab navigator (state was initialized once at mount).
  useFocusEffect(
    useCallback(() => {
      const storedUnit = (storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L') as GlucoseUnit;
      setGlucoseUnit(prev => (prev === storedUnit ? prev : storedUnit));
      refetchGlucose();
      refetchHistory();
      refetchLastInjection();
      refetchStreak();
    }, [refetchGlucose, refetchHistory, refetchLastInjection, refetchStreak])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchGlucose(),
      refetchHistory(),
      refetchLastInjection(),
      refetchInjectionTimes(),
      refetchFeedingTimes(),
    ]);
    setRefreshing(false);
  }, [
    refetchGlucose,
    refetchHistory,
    refetchLastInjection,
    refetchInjectionTimes,
    refetchFeedingTimes,
  ]);

  const nextInjection = useMemo(
    () =>
      injectionTimes?.length
        ? [...injectionTimes].sort(
            (a, b) => minutesUntil(a.timeOfDay) - minutesUntil(b.timeOfDay)
          )[0]
        : undefined,
    [injectionTimes]
  );
  const nextFeeding = useMemo(
    () =>
      feedingTimes?.length
        ? [...feedingTimes].sort((a, b) => minutesUntil(a.timeOfDay) - minutesUntil(b.timeOfDay))[0]
        : undefined,
    [feedingTimes]
  );
  const nextInjectionMinutes = nextInjection ? minutesUntil(nextInjection.timeOfDay) : null;
  const nextFeedingMinutes = nextFeeding ? minutesUntil(nextFeeding.timeOfDay) : null;

  const glucoseHours = latestGlucose ? hoursSince(latestGlucose.recordedAt) : null;
  const glucoseTimeSinceColor =
    glucoseHours === null
      ? theme.colors.textTertiary
      : glucoseHours < 6
        ? theme.colors.success
        : glucoseHours <= 12
          ? theme.colors.warning
          : theme.colors.danger;
  const trend = useMemo(
    () => calculateTrend((glucoseHistory as GlucoseReading[] | undefined) ?? []),
    [glucoseHistory]
  );
  const trendArrow = getTrendArrow(trend);
  const trendLabel = getTrendLabel(trend, t);
  const glucoseLevelLabel = latestGlucose
    ? {
        severe_low: t('glucose.severeLow'),
        low: t('glucose.low'),
        below_target: t('glucose.belowTarget'),
        normal: t('glucose.normal'),
        high: t('glucose.high'),
        very_high: t('glucose.veryHigh'),
      }[getGlucoseLevelFromRanges(latestGlucose.valueMmol, speciesRanges)]
    : undefined;

  // Onboarding can be skipped to browse, so the dashboard can be open with no
  // pet at all. Every logging screen already refuses to save without one
  // (doSave bails on an empty targetPetId), which means the user would fill in
  // a whole form and get a Save button that does nothing. Send them to create
  // the pet first instead of into that dead end.
  const requirePet = (go: () => void) => () => {
    if (pets.length === 0) {
      handleAddPetFromPicker();
      return;
    }
    go();
  };

  const quickActions = [
    {
      iconName: 'water' as const,
      iconColor: theme.colors.primary,
      label: t('dashboard.logGlucose'),
      color: theme.colors.primary,
      onPress: requirePet(() => navigation.navigate('LogGlucose', {})),
    },
    {
      iconName: 'medkit' as const,
      iconColor: theme.colors.secondary,
      label: t('dashboard.logInjection'),
      color: theme.colors.secondary,
      onPress: requirePet(() => navigation.navigate('LogInjection')),
    },
    {
      iconName: 'restaurant' as const,
      iconColor: theme.colors.success,
      label: t('dashboard.logFeeding'),
      color: theme.colors.success,
      onPress: requirePet(() => navigation.navigate('LogFeeding')),
    },
    {
      iconName: 'paw' as const,
      iconColor: theme.colors.warning,
      label: t('dashboard.logSymptom'),
      color: theme.colors.warning,
      onPress: requirePet(() => navigation.navigate('AddSymptom', {})),
    },
    {
      iconName: 'calendar' as const,
      iconColor: theme.colors.info ?? theme.colors.primary,
      label: t('dashboard.dailyDiary'),
      color: theme.colors.info ?? theme.colors.primary,
      onPress: requirePet(() => navigation.navigate('DailyDiary', {})),
    },
  ];

  const gradientColors = theme.isDark ? theme.gradients.headerRichDark : theme.gradients.headerRich;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Hero Gradient Header */}
        <LinearGradient
          colors={[...gradientColors] as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <SafeAreaView edges={['top']} style={styles.heroContent}>
            {/* Emergency banner — surfaces a dangerous glucose reading from the
                last 24h with a route to first aid (analyzer emergencyAlerts).
                Rendered INSIDE the top-safe-area hero: as the first child of the
                ScrollView it would sit under the status bar / notch. */}
            {showEmergency && (
              <View
                style={[
                  styles.emergencyBanner,
                  {
                    backgroundColor: theme.colors.danger,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1, gap: 2 }}
                  onPress={() => rootNavigation.navigate('Emergency')}
                  accessibilityRole="button"
                  accessibilityLabel={t('glucose.openEmergency')}
                >
                  <Text style={styles.emergencyBannerTitle}>
                    {emergencyAlerts.some(
                      a => a.type === 'hypoglycemia' || a.type === 'severe_hypoglycemia'
                    )
                      ? t('glucose.emergencyHypoTitle')
                      : t('glucose.emergencyHyperTitle')}
                  </Text>
                  <Text style={styles.emergencyBannerTap}>{t('glucose.emergencyBannerTap')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={dismissEmergency}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.dismiss', { defaultValue: 'Dismiss' })}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.emergencyDismiss}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.heroTop}>
              <TouchableOpacity
                style={styles.heroLeft}
                onPress={handleOpenPicker}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  hasMultiplePets
                    ? t('pets.switchPet', { defaultValue: 'Switch pet' })
                    : (activePet?.name ?? 'DiaPet')
                }
              >
                <View style={styles.petAvatar}>
                  <PetAvatar
                    photoUri={activePet?.photoUri}
                    species={activePet?.species}
                    size={44}
                    faceSize={22}
                  />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={[styles.greeting, { fontFamily: theme.fonts.medium }]}>
                    {t('dashboard.title')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={[styles.petName, { fontFamily: theme.fonts.bold, flexShrink: 1 }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {activePet?.name ?? 'DiaPet'}
                    </Text>
                    <Icon name="chevron-down" size={18} color="rgba(255,255,255,0.85)" />
                  </View>
                </View>
              </TouchableOpacity>
              {/* Y7: SOS screams red only during an actual emergency alert;
                  in the calm state it's a quiet outline — the owner shouldn't
                  see alarm colour every time they open the app */}
              <TouchableOpacity
                onPress={() => rootNavigation.navigate('Emergency')}
                style={[
                  styles.sosButton,
                  {
                    backgroundColor: showEmergency ? theme.colors.danger : 'rgba(255,255,255,0.14)',
                  },
                ]}
              >
                <Icon name="warning" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={[styles.sosText, { fontFamily: theme.fonts.bold }]}>SOS</Text>
              </TouchableOpacity>
            </View>

            {/* Glucose hero (R1) \u2014 the answer the owner opens the app for,
                full-width and 42px; injection/feeding drop to a second row */}
            <GlucoseHeroCard
              label={t('dashboard.lastGlucose')}
              value={
                latestGlucose
                  ? glucoseUnit === 'mg/dL'
                    ? `${latestGlucose.valueMgdl}`
                    : `${latestGlucose.valueMmol.toFixed(1)}`
                  : '\u2014'
              }
              unitLabel={glucoseUnit === 'mg/dL' ? t('common.mg_dl') : t('common.mmol_l')}
              color={
                latestGlucose
                  ? getGlucoseColorFromRanges(latestGlucose.valueMmol, speciesRanges)
                  : theme.colors.textTertiary
              }
              statusLabel={glucoseLevelLabel}
              dangerArrow={
                latestGlucose
                  ? getGlucoseArrowFromRanges(latestGlucose.valueMmol, speciesRanges)
                  : undefined
              }
              trendArrow={latestGlucose ? trendArrow : undefined}
              timeAgo={latestGlucose ? formatRelative(latestGlucose.recordedAt) : undefined}
              style={{ marginTop: 4 }}
            />
            <View style={styles.statusRow}>
              <StatusCard
                iconName="medkit-outline"
                iconColor={
                  nextInjectionMinutes !== null && nextInjectionMinutes < 30
                    ? theme.colors.warning
                    : theme.colors.primary
                }
                label={t('dashboard.nextInjection')}
                value={nextInjection ? nextInjection.timeOfDay : '\u2014'}
                color={
                  nextInjectionMinutes !== null && nextInjectionMinutes < 30
                    ? theme.colors.warning
                    : theme.colors.primary
                }
                subtitle={
                  nextInjectionMinutes !== null
                    ? t('dashboard.inTime', { time: formatCountdown(nextInjectionMinutes) })
                    : undefined
                }
                index={1}
              />
              <StatusCard
                iconName="restaurant-outline"
                iconColor={
                  nextFeedingMinutes !== null && nextFeedingMinutes < 30
                    ? theme.colors.warning
                    : theme.colors.success
                }
                label={t('dashboard.nextFeeding')}
                value={nextFeeding ? nextFeeding.timeOfDay : '\u2014'}
                color={
                  nextFeedingMinutes !== null && nextFeedingMinutes < 30
                    ? theme.colors.warning
                    : theme.colors.success
                }
                subtitle={
                  nextFeedingMinutes !== null
                    ? t('dashboard.inTime', { time: formatCountdown(nextFeedingMinutes) })
                    : undefined
                }
                index={2}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Time Since Last Glucose & Trend & Unit Toggle */}
        <View style={styles.timeSinceRow}>
          <View style={[styles.timeSinceBadge, { backgroundColor: glucoseTimeSinceColor + '20' }]}>
            <Text
              style={[
                styles.timeSinceText,
                { color: glucoseTimeSinceColor, fontFamily: theme.fonts.semibold },
              ]}
            >
              {glucoseHours !== null
                ? t('dashboard.timeSinceGlucose', { hours: glucoseHours })
                : t('dashboard.notMeasured')}
            </Text>
          </View>
          {/* Streak chip (3.3) — from 2 days up; a "1-day streak" is just today.
              Design M2: цвет БРЕНДА (primary), не warning — стрик это награда,
              а оранжевый в приложении = «внимание/тревога». */}
          {streakDays >= 2 && (
            <View style={[styles.trendBadge, { backgroundColor: theme.colors.primary + '18' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="flame" size={13} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.trendText,
                    { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t('dashboard.streakDays', { count: streakDays })}
                </Text>
              </View>
            </View>
          )}
          {trend && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: theme.colors.primaryLight ?? theme.colors.primary + '20' },
              ]}
            >
              <Text
                style={[
                  styles.trendText,
                  { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                ]}
              >
                {getTrendArrow(trend)} {trendLabel}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={toggleGlucoseUnit}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            style={[
              styles.unitToggle,
              {
                backgroundColor: theme.colors.primary + '18',
                borderColor: theme.colors.primary + '40',
              },
            ]}
            accessibilityLabel={t('dashboard.toggleUnit')}
            accessibilityRole="button"
          >
            <Icon name="swap-horizontal" size={14} color={theme.colors.primary} />
            <Text
              style={[
                styles.unitToggleText,
                { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
              ]}
            >
              {glucoseUnit}
            </Text>
          </TouchableOpacity>
        </View>

        {/* H7 Trial banner — shown while free trial is active (non-paid users only) */}
        {showTrialBanner && (
          <TouchableOpacity
            onPress={() => rootNavigation.navigate('Paywall')}
            activeOpacity={0.85}
            style={[
              styles.trialBanner,
              {
                backgroundColor: trialUrgent
                  ? theme.colors.warning + '18'
                  : theme.colors.success + '15',
                borderColor: trialUrgent ? theme.colors.warning : theme.colors.success,
              },
            ]}
          >
            <Icon
              name={trialUrgent ? 'time' : 'gift'}
              size={20}
              color={trialUrgent ? theme.colors.warning : theme.colors.success}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trialBannerTitle,
                  {
                    color: trialUrgent ? theme.colors.warning : theme.colors.success,
                    fontFamily: theme.fonts.bold,
                  },
                ]}
              >
                {trialUrgent
                  ? t('subscription.trial.bannerUrgentTitle', { count: trialDaysLeft })
                  : t('subscription.trial.bannerActiveTitle', { count: trialDaysLeft })}
              </Text>
              <Text style={[styles.trialBannerDesc, { color: theme.colors.textSecondary }]}>
                {trialUrgent
                  ? t('subscription.trial.bannerUrgentDesc')
                  : t('subscription.trial.bannerActiveDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Browsing user who skipped onboarding: every logging action below is
            useless without a pet, so make creating one the one obvious move
            rather than relying on the header tap. */}
        {pets.length === 0 && (
          <TouchableOpacity
            style={[styles.noPetCard, { backgroundColor: theme.colors.primary + '12' }]}
            onPress={handleAddPetFromPicker}
            accessibilityRole="button"
          >
            <Icon name="add-circle-outline" size={24} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.noPetTitle,
                  { color: theme.colors.text, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('dashboard.noPetTitle')}
              </Text>
              <Text style={[styles.noPetDesc, { color: theme.colors.textSecondary }]}>
                {t('dashboard.noPetDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* H9 First Win — pinned onboarding card. Banner budget (Y5): at most
            one auxiliary block at a time — the trial banner wins. */}
        {!showTrialBanner && pets.length > 0 && <FirstStepsCard />}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('dashboard.quickActions')}
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <QuickActionButton key={action.label} {...action} />
            ))}
          </View>
        </View>

        {/* Glucose Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, marginBottom: 0, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('dashboard.glucoseChart')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('GlucoseList')}>
              <Text
                style={[
                  styles.sectionLink,
                  { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>
          <Card>
            {glucoseHistory && glucoseHistory.length > 0 ? (
              <GlucoseChart data={glucoseHistory} species={activePet?.species} unit={glucoseUnit} />
            ) : (
              <View style={styles.noData}>
                <Icon
                  name="analytics-outline"
                  size={32}
                  color={theme.colors.textTertiary}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.noGlucoseData')}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Analyzer: Smart Insight + Risk Score + Trend */}
        {hasAnalyzerData && (
          <View style={styles.section}>
            {smartAlert && (
              <SmartInsightCard
                alert={smartAlert}
                onPress={() => navigation.navigate('AnalyzerDashboard')}
              />
            )}
            <View style={styles.analyzerRow}>
              {riskScore && (
                <View style={{ flex: 1 }}>
                  <RiskScoreWidget
                    score={riskScore.totalScore}
                    level={riskScore.level}
                    onPress={() => navigation.navigate('AnalyzerDashboard')}
                  />
                </View>
              )}
            </View>
            {analyzerTrends?.direction && (
              <View style={styles.analyzerTrendRow}>
                <TrendIndicator
                  direction={analyzerTrends.direction}
                  acceleration={analyzerTrends.acceleration}
                  compact
                />
                {analyzerTrends.timeInRange !== null && (
                  <View style={[styles.tirBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text
                      style={[
                        styles.tirText,
                        { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      TIR {analyzerTrends.timeInRange.toFixed(0)}%
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Weekly summary (3.2) — rolling 7 days vs previous week; also the
            landing content for the Sunday push. Needs ≥3 readings to be more
            than noise. */}
        {weeklySummary.measurements >= 3 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('weekly.title')}
            </Text>
            <Card>
              <View style={styles.weeklyRow}>
                <View style={styles.weeklyCell}>
                  <Text
                    style={[
                      styles.weeklyValue,
                      { color: theme.colors.text, fontFamily: theme.fonts.bold },
                    ]}
                  >
                    {weeklySummary.measurements}
                  </Text>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>
                    {t('weekly.measurements')}
                  </Text>
                </View>
                <View style={styles.weeklyCell}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text
                      style={[
                        styles.weeklyValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {weeklySummary.tir !== null ? `${Math.round(weeklySummary.tir)}%` : '—'}
                    </Text>
                    {weeklySummary.tirDelta !== null && Math.abs(weeklySummary.tirDelta) >= 1 && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: theme.fonts.semibold,
                          color:
                            weeklySummary.tirDelta > 0 ? theme.colors.success : theme.colors.danger,
                        }}
                      >
                        {weeklySummary.tirDelta > 0 ? '▲' : '▼'}
                        {Math.abs(Math.round(weeklySummary.tirDelta))}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>
                    {t('weekly.inRange')}
                  </Text>
                </View>
                <View style={styles.weeklyCell}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text
                      style={[
                        styles.weeklyValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {weeklySummary.avgMmol !== null
                        ? glucoseUnit === 'mg/dL'
                          ? `${mmolToMgdl(weeklySummary.avgMmol)}`
                          : weeklySummary.avgMmol.toFixed(1)
                        : '—'}
                    </Text>
                    {weeklySummary.avgDeltaMmol !== null &&
                      Math.abs(weeklySummary.avgDeltaMmol) >= 0.3 && (
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: theme.fonts.semibold,
                            // Lower average glucose is the good direction
                            color:
                              weeklySummary.avgDeltaMmol < 0
                                ? theme.colors.success
                                : theme.colors.warning,
                          }}
                        >
                          {/* L2: единый формат с TIR — стрелка + величина */}
                          {weeklySummary.avgDeltaMmol > 0 ? '▲' : '▼'}
                          {glucoseUnit === 'mg/dL'
                            ? Math.abs(mmolToMgdl(weeklySummary.avgDeltaMmol))
                            : Math.abs(weeklySummary.avgDeltaMmol).toFixed(1)}
                        </Text>
                      )}
                  </View>
                  <Text style={[styles.weeklyLabel, { color: theme.colors.textSecondary }]}>
                    {t('weekly.avg', {
                      unit: glucoseUnit === 'mg/dL' ? t('common.mg_dl') : t('common.mmol_l'),
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* H1: AI Smart Analysis + Feed Guide banner removed from Dashboard —
            AI/prediction accessed via Analyzer block; Feed Guide lives in Encyclopedia */}

        {/* Last Injection Info */}
        {lastInjection && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text, marginBottom: 0, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('dashboard.lastInjection')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('InjectionList')}>
                <Text
                  style={[
                    styles.sectionLink,
                    { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t('injection.history')}
                </Text>
              </TouchableOpacity>
            </View>
            <Card>
              <View style={styles.injectionRow}>
                <View
                  style={[styles.injectionIcon, { backgroundColor: theme.colors.secondaryLight }]}
                >
                  <Icon name="medkit" size={24} color={theme.colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.injectionDose,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {lastInjection.doseUnits} {t('common.units')} · {lastInjection.insulinType}
                  </Text>
                  <Text style={[styles.injectionTime, { color: theme.colors.textSecondary }]}>
                    {formatRelative(lastInjection.administeredAt)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Upgrade prompt for free users */}
        {isMonetizationEnabled && !isPro && (
          <TouchableOpacity
            style={[
              styles.upgradeCard,
              { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
            ]}
            onPress={() => rootNavigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[...theme.gradients.warm] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeIconCircle}
            >
              <Icon name="star" size={16} color="#fff" />
            </LinearGradient>
            <Text
              style={[
                styles.upgradeText,
                { color: theme.colors.text, fontFamily: theme.fonts.semibold },
              ]}
            >
              {t('subscription.upgradePrompt')}
            </Text>
            <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Feeding history. H1 (5e3dbae) dropped this link as a duplicate on the
            assumption that the Daily Diary covered it — it did not, and FeedingList
            became unreachable: no way to review or delete a feeding at all.
            Glucose and injections reach their lists from their own cards above. */}
        <TouchableOpacity
          style={[
            styles.historyLink,
            { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
          ]}
          onPress={() => navigation.navigate('FeedingList')}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <View
            style={[styles.historyIconCircle, { backgroundColor: `${theme.colors.success}15` }]}
          >
            <Icon name="restaurant-outline" size={16} color={theme.colors.success} />
          </View>
          <Text
            style={[
              styles.historyText,
              { color: theme.colors.text, fontFamily: theme.fonts.semibold },
            ]}
          >
            {t('feeding.history')}
          </Text>
          <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>
      <PetPickerSheet
        visible={pickerVisible}
        pets={pets}
        activePetId={activePet?.id}
        onSelect={handleSelectPet}
        onAddPet={handleAddPetFromPicker}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  emergencyBanner: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    gap: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  emergencyBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emergencyBannerTap: { color: '#fff', fontSize: 12, opacity: 0.9 },
  emergencyDismiss: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Hero
  heroGradient: {
    paddingBottom: 20,
  },
  heroContent: {
    paddingHorizontal: 20,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  petName: { fontSize: 28, color: '#FFFFFF' },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  sosText: { fontSize: 16, color: '#FFFFFF' },
  statusRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  // Content
  timeSinceRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  timeSinceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeSinceText: { fontSize: 12 },
  trendBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  trendText: { fontSize: 12 },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitToggleText: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  noPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
  },
  noPetTitle: { fontSize: 15, marginBottom: 2 },
  noPetDesc: { fontSize: 13, lineHeight: 17 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  noData: { padding: 32, alignItems: 'center' },
  noDataText: { fontSize: 14 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLink: { fontSize: 13 },
  injectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  injectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  injectionDose: { fontSize: 16 },
  injectionTime: { fontSize: 13, marginTop: 2 },
  historyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
  },
  historyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: { flex: 1, fontSize: 13 },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
  },
  upgradeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeText: { flex: 1, fontSize: 13 },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  trialBannerTitle: { fontSize: 14 },
  trialBannerDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  analyzerRow: { marginTop: 8 },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weeklyCell: { flex: 1, alignItems: 'center', gap: 2 },
  weeklyValue: { fontSize: 22, fontVariant: ['tabular-nums'] },
  weeklyLabel: { fontSize: 11, textAlign: 'center' },
  analyzerTrendRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  tirBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tirText: { fontSize: 12 },
});
