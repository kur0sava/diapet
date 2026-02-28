import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useHomeNavigation, useRootNavigation } from '@navigation/hooks';
import { useTheme } from '@shared/theme';
import { useQuery } from '@tanstack/react-query';
import { glucoseRepository, injectionRepository, scheduleRepository } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { Card, GlucoseValueBadge } from '@shared/components/ui';
import { GlucoseChart } from '../components/GlucoseChart';
import { StatusCard } from '../components/StatusCard';
import { QuickActionButton } from '../components/QuickActionButton';
import { formatRelative, minutesUntil, formatCountdown, hoursSince } from '@shared/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { usePetStore } from '@shared/stores/petStore';
import { useSubscription } from '@features/subscription/hooks/useSubscription';

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
    case 'up': return ' \u2191';
    case 'down': return ' \u2193';
    case 'stable': return ' \u2192';
    default: return '';
  }
}

function getTrendLabel(trend: 'up' | 'down' | 'stable' | null, t: (key: string) => string): string {
  switch (trend) {
    case 'up': return t('dashboard.trendUp');
    case 'down': return t('dashboard.trendDown');
    case 'stable': return t('dashboard.trendStable');
    default: return '';
  }
}

export default function DashboardScreen() {
  const navigation = useHomeNavigation();
  const rootNavigation = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const { isPro } = useSubscription();
  const petId = activePet?.id ?? '';

  const { data: latestGlucose, refetch: refetchGlucose } = useQuery({
    queryKey: ['glucose', 'latest', petId],
    queryFn: () => glucoseRepository.findLatest(petId),
    enabled: !!petId,
  });

  const { data: glucoseHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['glucose', '7days', petId],
    queryFn: () => glucoseRepository.findLast7Days(petId),
    enabled: !!petId,
  });

  const { data: lastInjection } = useQuery({
    queryKey: ['injections', 'latest', petId],
    queryFn: () => injectionRepository.findLatest(petId),
    enabled: !!petId,
  });

  const { data: injectionTimes } = useQuery({
    queryKey: ['schedule', 'injections', petId],
    queryFn: () => scheduleRepository.getInjectionTimes(petId),
    enabled: !!petId,
  });

  const { data: feedingTimes } = useQuery({
    queryKey: ['schedule', 'feedings', petId],
    queryFn: () => scheduleRepository.getFeedingTimes(petId),
    enabled: !!petId,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGlucose(), refetchHistory()]);
    setRefreshing(false);
  }, [refetchGlucose, refetchHistory]);

  const nextInjection = injectionTimes?.length
    ? [...injectionTimes].sort((a, b) => minutesUntil(a.timeOfDay) - minutesUntil(b.timeOfDay))[0]
    : undefined;
  const nextFeeding = feedingTimes?.length
    ? [...feedingTimes].sort((a, b) => minutesUntil(a.timeOfDay) - minutesUntil(b.timeOfDay))[0]
    : undefined;
  const nextInjectionMinutes = nextInjection ? minutesUntil(nextInjection.timeOfDay) : null;
  const nextFeedingMinutes = nextFeeding ? minutesUntil(nextFeeding.timeOfDay) : null;

  const glucoseHours = latestGlucose ? hoursSince(latestGlucose.recordedAt) : null;
  const glucoseTimeSinceColor =
    glucoseHours === null ? theme.colors.textTertiary :
    glucoseHours < 6 ? theme.colors.success :
    glucoseHours <= 12 ? theme.colors.warning :
    theme.colors.danger;
  const trend = calculateTrend(glucoseHistory as GlucoseReading[] ?? []);
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
  ];

  const gradientColors = theme.isDark ? theme.gradients.headerRichDark : theme.gradients.headerRich;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
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
                  <Ionicons name="paw" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.greeting, { fontFamily: theme.fonts.medium }]}>
                    {t('dashboard.title')}
                  </Text>
                  <Text style={[styles.petName, { fontFamily: theme.fonts.bold }]}>
                    {activePet?.name ?? 'DiaPet'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => rootNavigation.navigate('Emergency')}
                style={styles.sosButton}
              >
                <Ionicons name="warning" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={[styles.sosText, { fontFamily: theme.fonts.bold }]}>SOS</Text>
              </TouchableOpacity>
            </View>

            {/* Status Cards inside gradient */}
            <View style={styles.statusRow}>
              <StatusCard
                iconName="water-outline"
                iconColor={latestGlucose ? (latestGlucose.valueMmol < 4 || latestGlucose.valueMmol > 9 ? theme.colors.danger : theme.colors.success) : theme.colors.textTertiary}
                label={t('dashboard.lastGlucose')}
                value={latestGlucose ? `${latestGlucose.valueMmol.toFixed(1)}${trendArrow}` : '\u2014'}
                unit={t('common.mmol_l')}
                color={latestGlucose ? (latestGlucose.valueMmol < 4 || latestGlucose.valueMmol > 9 ? theme.colors.danger : theme.colors.success) : theme.colors.textTertiary}
                subtitle={latestGlucose ? formatRelative(latestGlucose.recordedAt) : undefined}
                index={0}
              />
              <StatusCard
                iconName="medkit-outline"
                iconColor={nextInjectionMinutes !== null && nextInjectionMinutes < 30 ? theme.colors.warning : theme.colors.primary}
                label={t('dashboard.nextInjection')}
                value={nextInjection ? nextInjection.timeOfDay : '\u2014'}
                color={nextInjectionMinutes !== null && nextInjectionMinutes < 30 ? theme.colors.warning : theme.colors.primary}
                subtitle={nextInjectionMinutes !== null ? t('dashboard.inTime', { time: formatCountdown(nextInjectionMinutes) }) : undefined}
                index={1}
              />
              <StatusCard
                iconName="restaurant-outline"
                iconColor={nextFeedingMinutes !== null && nextFeedingMinutes < 30 ? theme.colors.warning : theme.colors.success}
                label={t('dashboard.nextFeeding')}
                value={nextFeeding ? nextFeeding.timeOfDay : '\u2014'}
                color={nextFeedingMinutes !== null && nextFeedingMinutes < 30 ? theme.colors.warning : theme.colors.success}
                subtitle={nextFeedingMinutes !== null ? t('dashboard.inTime', { time: formatCountdown(nextFeedingMinutes) }) : undefined}
                index={2}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Time Since Last Glucose & Trend */}
        <View style={styles.timeSinceRow}>
          <View style={[styles.timeSinceBadge, { backgroundColor: glucoseTimeSinceColor + '20' }]}>
            <Text style={[styles.timeSinceText, { color: glucoseTimeSinceColor, fontFamily: theme.fonts.semibold }]}>
              {glucoseHours !== null
                ? t('dashboard.timeSinceGlucose', { hours: glucoseHours })
                : t('dashboard.notMeasured')}
            </Text>
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: theme.colors.primaryLight ?? theme.colors.primary + '20' }]}>
              <Text style={[styles.trendText, { color: theme.colors.primary, fontFamily: theme.fonts.semibold }]}>
                {getTrendArrow(trend)} {trendLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('dashboard.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <QuickActionButton key={action.label} {...action} />
            ))}
          </View>
        </View>

        {/* Glucose Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('dashboard.glucoseChart')}
          </Text>
          <Card>
            {glucoseHistory && glucoseHistory.length > 0 ? (
              <GlucoseChart data={glucoseHistory} />
            ) : (
              <View style={styles.noData}>
                <Ionicons name="analytics-outline" size={32} color={theme.colors.textTertiary} style={{ marginBottom: 8 }} />
                <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                  {t('dashboard.noGlucoseData')}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Last Injection Info */}
        {lastInjection && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0, fontFamily: theme.fonts.bold }]}>{t('dashboard.lastInjection')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('InjectionList')}>
                <Text style={[styles.sectionLink, { color: theme.colors.primary, fontFamily: theme.fonts.semibold }]}>{t('injection.history')}</Text>
              </TouchableOpacity>
            </View>
            <Card>
              <View style={styles.injectionRow}>
                <View style={[styles.injectionIcon, { backgroundColor: theme.colors.secondaryLight }]}>
                  <Ionicons name="medkit" size={24} color={theme.colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.injectionDose, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
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
            style={[styles.upgradeCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
            onPress={() => rootNavigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFB340', '#FF9500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeIconCircle}
            >
              <Ionicons name="star" size={16} color="#fff" />
            </LinearGradient>
            <Text style={[styles.upgradeText, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
              {t('subscription.upgradePrompt')}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* History Links */}
        <View style={styles.section}>
          <View style={styles.historyLinksRow}>
            <TouchableOpacity
              style={[styles.historyLink, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
              onPress={() => navigation.navigate('InjectionList')}
              activeOpacity={0.8}
            >
              <View style={[styles.historyIcon, { backgroundColor: theme.colors.secondaryLight }]}>
                <Ionicons name="medkit-outline" size={18} color={theme.colors.secondary} />
              </View>
              <Text style={[styles.historyLinkText, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{t('injection.history')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.historyLink, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
              onPress={() => navigation.navigate('FeedingList')}
              activeOpacity={0.8}
            >
              <View style={[styles.historyIcon, { backgroundColor: theme.colors.successLight }]}>
                <Ionicons name="restaurant-outline" size={18} color={theme.colors.success} />
              </View>
              <Text style={[styles.historyLinkText, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>{t('feeding.history')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  sosText: { fontSize: 14, color: '#FFFFFF' },
  statusRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  // Content
  timeSinceRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 16, marginBottom: 4, flexWrap: 'wrap' },
  timeSinceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeSinceText: { fontSize: 12 },
  trendBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  trendText: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 17, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  noData: { padding: 32, alignItems: 'center' },
  noDataText: { fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLink: { fontSize: 13 },
  injectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  injectionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  injectionDose: { fontSize: 16 },
  injectionTime: { fontSize: 13, marginTop: 2 },
  historyLinksRow: { flexDirection: 'row', gap: 12 },
  historyLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 16 },
  historyIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  historyLinkText: { flex: 1, fontSize: 13 },
  upgradeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 16 },
  upgradeIconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  upgradeText: { flex: 1, fontSize: 13 },
});
