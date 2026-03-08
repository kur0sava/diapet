import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isToday, isYesterday, addDays, subDays, startOfDay, isValid } from 'date-fns';
import { ru as dateFnsRu, enUS } from 'date-fns/locale';
import i18next from 'i18next';

import { useTheme } from '@shared/theme';
import { useHomeNavigation } from '@navigation/hooks';
import { usePetStore } from '@shared/stores/petStore';
import { glucoseRepository } from '@storage/database/repositories/glucoseRepository';
import { injectionRepository } from '@storage/database/repositories/injectionRepository';
import { feedingRepository } from '@storage/database/repositories/feedingRepository';
import { getGlucoseColor, GlucoseUnit, MGDL_PER_MMOLL } from '@storage/domain/types';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { analyzeDayGlucose, computeDayStats } from '../utils/diaryAnalyzer';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';

type TimelineEvent = {
  id: string;
  time: string;
  type: 'glucose' | 'injection' | 'feeding';
  title: string;
  subtitle?: string;
  color: string;
};

function formatDayHeader(date: Date, t: (k: string) => string): string {
  const locale = i18next.language === 'ru' ? dateFnsRu : enUS;
  if (isToday(date)) return t('common.today');
  if (isYesterday(date)) return t('common.yesterday');
  return format(date, 'd MMMM', { locale });
}

export default function DailyDiaryScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'DailyDiary'>>();
  const activePet = usePetStore(s => s.activePet);
  const petId = activePet?.id ?? '';

  const glucoseUnit = (storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L') as GlucoseUnit;

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (route.params?.date) {
      const parsed = parseISO(route.params.date);
      return isValid(parsed) ? parsed : new Date();
    }
    return new Date();
  });

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const isFuture = startOfDay(currentDate) > startOfDay(new Date());

  const goToPrevDay = useCallback(() => setCurrentDate(d => subDays(d, 1)), []);
  const goToNextDay = useCallback(() => {
    if (!isToday(currentDate)) {
      setCurrentDate(d => addDays(d, 1));
    }
  }, [currentDate]);

  const { data: glucoseReadings = [], isLoading: loadingGlucose, isError: errGlucose, refetch: refetchGlucose } = useQuery({
    queryKey: ['diary', 'glucose', petId, dateStr],
    queryFn: () => glucoseRepository.findForDay(petId, dateStr),
    enabled: !!petId,
  });

  const { data: injections = [], isLoading: loadingInj, isError: errInj, refetch: refetchInj } = useQuery({
    queryKey: ['diary', 'injection', petId, dateStr],
    queryFn: () => injectionRepository.findForDay(petId, dateStr),
    enabled: !!petId,
  });

  const { data: feedings = [], isLoading: loadingFeed, isError: errFeed, refetch: refetchFeed } = useQuery({
    queryKey: ['diary', 'feeding', petId, dateStr],
    queryFn: () => feedingRepository.findForDay(petId, dateStr),
    enabled: !!petId,
  });

  const isLoading = loadingGlucose || loadingInj || loadingFeed;
  const isError = errGlucose || errInj || errFeed;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGlucose(), refetchInj(), refetchFeed()]);
    setRefreshing(false);
  }, [refetchGlucose, refetchInj, refetchFeed]);

  const timeline: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];

    for (const g of glucoseReadings) {
      const valueStr = glucoseUnit === 'mg/dL'
        ? `${g.valueMgdl} ${t('common.mg_dl')}`
        : `${g.valueMmol.toFixed(1)} ${t('common.mmol_l')}`;
      events.push({
        id: g.id,
        time: g.recordedAt,
        type: 'glucose',
        title: valueStr,
        subtitle: g.mealRelation === 'before_meal' ? t('glucose.beforeMeal')
          : g.mealRelation === 'after_meal' ? t('glucose.afterMeal')
          : g.mealRelation === 'fasting' ? t('glucose.fasting')
          : undefined,
        color: getGlucoseColor(g.valueMmol),
      });
    }

    for (const inj of injections) {
      events.push({
        id: inj.id,
        time: inj.administeredAt,
        type: 'injection',
        title: `${inj.doseUnits} ${t('common.units')} ${inj.insulinType}`,
        subtitle: inj.notes ?? undefined,
        color: theme.colors.secondary,
      });
    }

    for (const feed of feedings) {
      const parts: string[] = [];
      if (feed.foodType) parts.push(feed.foodType);
      if (feed.amountGrams) parts.push(`${feed.amountGrams} ${t('common.grams')}`);
      events.push({
        id: feed.id,
        time: feed.fedAt,
        type: 'feeding',
        title: parts.length > 0 ? parts.join(' · ') : t('diary.feeding'),
        subtitle: feed.notes ?? undefined,
        color: theme.colors.success,
      });
    }

    return events.sort((a, b) => a.time.localeCompare(b.time));
  }, [glucoseReadings, injections, feedings, glucoseUnit, t, theme]);

  const stats = useMemo(() => computeDayStats(glucoseReadings), [glucoseReadings]);
  const recommendations = useMemo(() => analyzeDayGlucose(glucoseReadings), [glucoseReadings]);

  const recTypeColors: Record<string, string> = {
    critical: theme.colors.danger,
    warning: theme.colors.warning,
    info: theme.colors.primary,
    good: theme.colors.success,
  };
  const recTypeIcons: Record<string, string> = {
    critical: 'alert-circle',
    warning: 'warning',
    info: 'information-circle',
    good: 'checkmark-circle',
  };

  function getEventIcon(type: TimelineEvent['type']): string {
    switch (type) {
      case 'glucose': return 'water';
      case 'injection': return 'medkit';
      case 'feeding': return 'restaurant';
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {t('diary.title')}
        </Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      {/* Date Navigator */}
      <View style={[styles.dateNav, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.divider }]}>
        <TouchableOpacity onPress={goToPrevDay} style={styles.dateNavBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => !isToday(currentDate) && setCurrentDate(new Date())}
          disabled={isToday(currentDate)}
          style={styles.dateLabelBtn}
        >
          <Text style={[styles.dateLabel, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
            {formatDayHeader(currentDate, t)}
          </Text>
          {!isToday(currentDate) && (
            <Text style={[styles.dateSub, { color: theme.colors.primary }]}>
              {format(currentDate, 'dd.MM.yyyy')} · {t('common.today')} →
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToNextDay}
          style={[styles.dateNavBtn, isToday(currentDate) && styles.dateNavBtnDisabled]}
          disabled={isToday(currentDate)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-forward" size={20} color={isToday(currentDate) ? theme.colors.textTertiary : theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {!petId && (
        <View style={styles.centered}>
          <Ionicons name="paw-outline" size={40} color={theme.colors.textTertiary} style={{ marginBottom: 10 }} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('common.noData')}</Text>
        </View>
      )}

      {isError && petId && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.colors.danger} style={{ marginBottom: 8 }} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('common.error')}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >

        {/* Stats Row */}
        {stats.count > 0 && (
          <View style={[styles.statsRow, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                {glucoseUnit === 'mg/dL'
                  ? `${Math.round((stats.avg ?? 0) * MGDL_PER_MMOLL)}`
                  : `${stats.avg?.toFixed(1) ?? '—'}`}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('diary.avg')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success, fontFamily: theme.fonts.bold }]}>
                {stats.inRangePercent ?? 0}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('diary.inRange')}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                {stats.count}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('diary.measurements')}</Text>
            </View>
          </View>
        )}

        {/* AI Recommendation Panel */}
        {glucoseReadings.length > 0 && (
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
              {t('diary.adviceTitle')}
            </Text>
            {recommendations.map((rec, i) => {
              const recColor = recTypeColors[rec.type] ?? theme.colors.primary;
              const recIcon = recTypeIcons[rec.type] ?? 'information-circle';
              return (
                <View
                  key={i}
                  style={[styles.recCard, { backgroundColor: recColor + '18', borderLeftColor: recColor }]}
                >
                  <Ionicons name={recIcon as never} size={18} color={recColor} style={{ marginRight: 8 }} />
                  <Text style={[styles.recText, { color: theme.colors.text }]}>
                    {t(rec.messageKey, rec.params ?? {})}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('diary.timeline')}
          </Text>

          {isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}

          {!isLoading && timeline.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color={theme.colors.textTertiary} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {isFuture ? t('diary.futureDate') : t('diary.noEvents')}
              </Text>
            </View>
          )}

          {!isLoading && timeline.map((event, index) => (
            <View key={event.id} style={styles.timelineItem}>
              {/* Connector line */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: event.color }]}>
                  <Ionicons name={getEventIcon(event.type) as never} size={12} color="#fff" />
                </View>
                {index < timeline.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: theme.colors.divider }]} />
                )}
              </View>
              {/* Content */}
              <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
                <View style={styles.timelineCardTop}>
                  <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                    {(() => { const d = parseISO(event.time); return isValid(d) ? format(d, 'HH:mm') : '--:--'; })()}
                  </Text>
                  <Text style={[styles.timelineTitle, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
                    {event.title}
                  </Text>
                </View>
                {event.subtitle && (
                  <Text style={[styles.timelineSubtitle, { color: theme.colors.textTertiary }]}>
                    {event.subtitle}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add Entries Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('diary.addEntry')}
          </Text>
          <View style={styles.addRow}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.colors.primary + '18' }]}
              onPress={() => navigation.navigate('LogGlucose', {})}
            >
              <Ionicons name="water" size={20} color={theme.colors.primary} />
              <Text style={[styles.addBtnText, { color: theme.colors.primary, fontFamily: theme.fonts.medium }]} numberOfLines={2}>
                {t('dashboard.logGlucose')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.colors.secondary + '18' }]}
              onPress={() => navigation.navigate('LogInjection')}
            >
              <Ionicons name="medkit" size={20} color={theme.colors.secondary} />
              <Text style={[styles.addBtnText, { color: theme.colors.secondary, fontFamily: theme.fonts.medium }]} numberOfLines={2}>
                {t('dashboard.logInjection')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.colors.success + '18' }]}
              onPress={() => navigation.navigate('LogFeeding')}
            >
              <Ionicons name="restaurant" size={20} color={theme.colors.success} />
              <Text style={[styles.addBtnText, { color: theme.colors.success, fontFamily: theme.fonts.medium }]} numberOfLines={2}>
                {t('dashboard.logFeeding')}
              </Text>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  screenTitle: { flex: 1, fontSize: 17, textAlign: 'center' },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateNavBtn: { padding: 4 },
  dateNavBtnDisabled: { opacity: 0.3 },
  dateLabelBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dateLabel: { fontSize: 16, textAlign: 'center' },
  dateSub: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  scrollContent: { paddingBottom: 120 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, lineHeight: 26 },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 15, marginBottom: 12 },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  recText: { flex: 1, fontSize: 13, lineHeight: 18 },
  centered: { alignItems: 'center', paddingVertical: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  timelineItem: { flexDirection: 'row', marginBottom: 8 },
  timelineLeft: { alignItems: 'center', width: 36, marginRight: 10 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: { flex: 1, width: 2, marginTop: 4 },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  timelineCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineTime: { fontSize: 12, width: 40 },
  timelineTitle: { flex: 1, fontSize: 14 },
  timelineSubtitle: { fontSize: 12, marginTop: 4 },
  addRow: { flexDirection: 'row', gap: 8 },
  addBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { fontSize: 11, textAlign: 'center' },
});
