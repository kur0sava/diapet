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

interface GlucoseReading {
  valueMmol: number;
  recordedAt: string;
}

function calculateTrend(readings: GlucoseReading[]): 'up' | 'down' | 'stable' | null {
  if (!readings || readings.length < 3) return null;
  const last3 = readings.slice(0, 3); // Already sorted by date DESC
  const [a, b, c] = last3.map(r => r.valueMmol);
  if (a > b && b > c) return 'up';
  if (a < b && b < c) return 'down';
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
      icon: '💧',
      label: t('dashboard.logGlucose'),
      color: theme.colors.primary,
      onPress: () => navigation.navigate('LogGlucose', {}),
    },
    {
      icon: '💉',
      label: t('dashboard.logInjection'),
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('LogInjection'),
    },
    {
      icon: '🍽️',
      label: t('dashboard.logFeeding'),
      color: theme.colors.success,
      onPress: () => navigation.navigate('LogFeeding'),
    },
    {
      icon: '🐾',
      label: t('dashboard.logSymptom'),
      color: theme.colors.warning,
      onPress: () => navigation.navigate('AddSymptom', {}),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            {t('dashboard.title')}
          </Text>
          <Text style={[styles.petName, { color: theme.colors.text }]}>
            {activePet?.name ?? 'DiaPet'} 🐱
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => rootNavigation.navigate('Emergency')}
          style={[styles.sosButton, { backgroundColor: theme.colors.dangerLight }]}
        >
          <Text style={[styles.sosText, { color: theme.colors.danger }]}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Status Cards Row */}
        <View style={styles.statusRow}>
          <StatusCard
            icon="💧"
            label={t('dashboard.lastGlucose')}
            value={latestGlucose ? `${latestGlucose.valueMmol.toFixed(1)}${trendArrow}` : '—'}
            unit={t('common.mmol_l')}
            color={latestGlucose ? (latestGlucose.valueMmol < 4 || latestGlucose.valueMmol > 9 ? theme.colors.danger : theme.colors.success) : theme.colors.textTertiary}
            subtitle={latestGlucose ? formatRelative(latestGlucose.recordedAt) : undefined}
          />
          <StatusCard
            icon="💉"
            label={t('dashboard.nextInjection')}
            value={nextInjection ? nextInjection.timeOfDay : '—'}
            color={nextInjectionMinutes !== null && nextInjectionMinutes < 30 ? theme.colors.warning : theme.colors.primary}
            subtitle={nextInjectionMinutes !== null ? t('dashboard.inTime', { time: formatCountdown(nextInjectionMinutes) }) : undefined}
          />
          <StatusCard
            icon="🍽️"
            label={t('dashboard.nextFeeding')}
            value={nextFeeding ? nextFeeding.timeOfDay : '—'}
            color={nextFeedingMinutes !== null && nextFeedingMinutes < 30 ? theme.colors.warning : theme.colors.success}
            subtitle={nextFeedingMinutes !== null ? t('dashboard.inTime', { time: formatCountdown(nextFeedingMinutes) }) : undefined}
          />
        </View>

        {/* Time Since Last Glucose & Trend */}
        <View style={styles.timeSinceRow}>
          <View style={[styles.timeSinceBadge, { backgroundColor: glucoseTimeSinceColor + '20' }]}>
            <Text style={[styles.timeSinceText, { color: glucoseTimeSinceColor }]}>
              {glucoseHours !== null
                ? t('dashboard.timeSinceGlucose', { hours: glucoseHours })
                : t('dashboard.notMeasured')}
            </Text>
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: theme.colors.primaryLight ?? theme.colors.primary + '20' }]}>
              <Text style={[styles.trendText, { color: theme.colors.primary }]}>
                {getTrendArrow(trend)} {trendLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('dashboard.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, i) => (
              <QuickActionButton key={action.label} {...action} />
            ))}
          </View>
        </View>

        {/* Glucose Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('dashboard.glucoseChart')}
          </Text>
          <Card>
            {glucoseHistory && glucoseHistory.length > 0 ? (
              <GlucoseChart data={glucoseHistory} />
            ) : (
              <View style={styles.noData}>
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
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>{t('dashboard.lastInjection')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('InjectionList')}>
                <Text style={[styles.sectionLink, { color: theme.colors.primary }]}>{t('injection.history')}</Text>
              </TouchableOpacity>
            </View>
            <Card>
              <View style={styles.injectionRow}>
                <Text style={{ fontSize: 28 }}>💉</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.injectionDose, { color: theme.colors.text }]}>
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

        {/* History Links */}
        <View style={styles.section}>
          <View style={styles.historyLinksRow}>
            <TouchableOpacity
              style={[styles.historyLink, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('InjectionList')}
            >
              <Text style={{ fontSize: 20 }}>💉</Text>
              <Text style={[styles.historyLinkText, { color: theme.colors.text }]}>{t('injection.history')}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.historyLink, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('FeedingList')}
            >
              <Text style={{ fontSize: 20 }}>🍽️</Text>
              <Text style={[styles.historyLinkText, { color: theme.colors.text }]}>{t('feeding.history')}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  petName: { fontSize: 24, fontWeight: '800' },
  sosButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sosText: { fontWeight: '800', fontSize: 14 },
  scrollContent: { paddingBottom: 100 },
  statusRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  timeSinceRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  timeSinceBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeSinceText: { fontSize: 12, fontWeight: '600' },
  trendBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  trendText: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  noData: { padding: 32, alignItems: 'center' },
  noDataText: { fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLink: { fontSize: 13, fontWeight: '600' },
  injectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  injectionDose: { fontSize: 16, fontWeight: '600' },
  injectionTime: { fontSize: 13, marginTop: 2 },
  historyLinksRow: { flexDirection: 'row', gap: 12 },
  historyLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1 },
  historyLinkText: { flex: 1, fontSize: 13, fontWeight: '600' },
});
