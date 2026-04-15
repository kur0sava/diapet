import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
import { QuickActionButton } from '../components/QuickActionButton';
import { FirstStepsCard } from '../components/FirstStepsCard';
import { formatRelative, minutesUntil, formatCountdown, hoursSince } from '@shared/utils/dateUtils';
import { getGlucoseColorFromRanges } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { Icon } from '@shared/components/ui/Icon';
import { usePetStore } from '@shared/stores/petStore';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { useFocusEffect } from '@react-navigation/native';
import { useAnalyzer } from '@features/analyzer/hooks/useAnalyzer';
import { RiskScoreWidget } from '@features/analyzer/components/RiskScoreWidget';
import { TrendIndicator } from '@features/analyzer/components/TrendIndicator';
import { SmartInsightCard } from '@features/analyzer/components/SmartInsightCard';

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
  const speciesRanges = getSpeciesConfig(activePet?.species ?? 'cat').glucose.ranges;
  const { isPro } = useSubscription();
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
  }, [glucoseUnit, queryClient]);

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

  const {
    trends: analyzerTrends,
    riskScore,
    smartAlert,
    hasEnoughData: hasAnalyzerData,
  } = useAnalyzer();

  const [refreshing, setRefreshing] = React.useState(false);

  // Refetch data when tab gains focus
  useFocusEffect(
    useCallback(() => {
      refetchGlucose();
      refetchHistory();
      refetchLastInjection();
    }, [refetchGlucose, refetchHistory, refetchLastInjection])
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

  const quickActions = [
    {
      iconName: 'water' as const,
      iconColor: theme.colors.primary,
      label: t('dashboard.logGlucose'),
      color: theme.colors.primary,
      onPress: () => navigation.navigate('LogGlucose', {}),
    },
    {
      iconName: 'medkit' as const,
      iconColor: theme.colors.secondary,
      label: t('dashboard.logInjection'),
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('LogInjection'),
    },
    {
      iconName: 'restaurant' as const,
      iconColor: theme.colors.success,
      label: t('dashboard.logFeeding'),
      color: theme.colors.success,
      onPress: () => navigation.navigate('LogFeeding'),
    },
    {
      iconName: 'paw' as const,
      iconColor: theme.colors.warning,
      label: t('dashboard.logSymptom'),
      color: theme.colors.warning,
      onPress: () => navigation.navigate('AddSymptom', {}),
    },
    {
      iconName: 'calendar' as const,
      iconColor: theme.colors.info ?? theme.colors.primary,
      label: t('dashboard.dailyDiary'),
      color: theme.colors.info ?? theme.colors.primary,
      onPress: () => navigation.navigate('DailyDiary', {}),
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
            <View style={styles.heroTop}>
              <View style={styles.heroLeft}>
                <View style={styles.petAvatar}>
                  <Icon name="paw" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={[styles.greeting, { fontFamily: theme.fonts.medium }]}>
                    {t('dashboard.title')}
                  </Text>
                  <Text
                    style={[styles.petName, { fontFamily: theme.fonts.bold }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                  >
                    {activePet?.name ?? 'DiaPet'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => rootNavigation.navigate('Emergency')}
                style={[styles.sosButton, { backgroundColor: theme.colors.danger }]}
              >
                <Icon name="warning" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={[styles.sosText, { fontFamily: theme.fonts.bold }]}>SOS</Text>
              </TouchableOpacity>
            </View>

            {/* Status Cards inside gradient */}
            <View style={styles.statusRow}>
              <StatusCard
                iconName="water-outline"
                iconColor={
                  latestGlucose
                    ? getGlucoseColorFromRanges(latestGlucose.valueMmol, speciesRanges)
                    : theme.colors.textTertiary
                }
                label={t('dashboard.lastGlucose')}
                value={
                  latestGlucose
                    ? glucoseUnit === 'mg/dL'
                      ? `${latestGlucose.valueMgdl}${trendArrow}`
                      : `${latestGlucose.valueMmol.toFixed(1)}${trendArrow}`
                    : '\u2014'
                }
                unit={glucoseUnit === 'mg/dL' ? t('common.mg_dl') : t('common.mmol_l')}
                color={
                  latestGlucose
                    ? getGlucoseColorFromRanges(latestGlucose.valueMmol, speciesRanges)
                    : theme.colors.textTertiary
                }
                subtitle={latestGlucose ? formatRelative(latestGlucose.recordedAt) : undefined}
                index={0}
              />
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

        {/* H9 First Win — pinned onboarding card */}
        <FirstStepsCard />

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
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.bold },
            ]}
          >
            {t('dashboard.glucoseChart')}
          </Text>
          <Card>
            {glucoseHistory && glucoseHistory.length > 0 ? (
              <GlucoseChart data={glucoseHistory} species={activePet?.species} />
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
        {!isPro && (
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

        {/* H1: History Links row removed — Last Injection card already links to InjectionList;
            Feeding history available from Daily Diary / QuickAction */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  unitToggleText: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginTop: 20 },
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
  analyzerRow: { marginTop: 8 },
  analyzerTrendRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  tirBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tirText: { fontSize: 12 },
});
