import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRootNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { glucoseRepository, injectionRepository, symptomRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { GlucoseReading, getGlucoseColor, MealRelation } from '../types';
import { GlucoseFilter, GLUCOSE_RANGES, mmolToMgdl } from '@storage/domain/types';
import { formatDateTime, formatFullDate, formatFullDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card, AnimatedListItem } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { generateVetReportPdf } from '@shared/utils/pdfExport';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { subDays } from 'date-fns';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LevelPreset = { key: string; labelKey: string; min?: number; max?: number; color: string };

const LEVEL_PRESETS: LevelPreset[] = [
  { key: 'severe_low', labelKey: 'glucose.severeLow', max: GLUCOSE_RANGES.severe_low.max, color: GLUCOSE_RANGES.severe_low.color },
  { key: 'low', labelKey: 'glucose.low', min: GLUCOSE_RANGES.low.min, max: GLUCOSE_RANGES.low.max, color: GLUCOSE_RANGES.low.color },
  { key: 'below_target', labelKey: 'glucose.belowTarget', min: GLUCOSE_RANGES.below_target.min, max: GLUCOSE_RANGES.below_target.max, color: GLUCOSE_RANGES.below_target.color },
  { key: 'normal', labelKey: 'glucose.normal', min: GLUCOSE_RANGES.normal.min, max: GLUCOSE_RANGES.normal.max, color: GLUCOSE_RANGES.normal.color },
  { key: 'high', labelKey: 'glucose.high', min: GLUCOSE_RANGES.high.min, max: GLUCOSE_RANGES.high.max, color: GLUCOSE_RANGES.high.color },
  { key: 'very_high', labelKey: 'glucose.veryHigh', min: GLUCOSE_RANGES.very_high.min, color: GLUCOSE_RANGES.very_high.color },
];

type MealOption = { value: MealRelation; labelKey: string };

const MEAL_OPTIONS: MealOption[] = [
  { value: 'before_meal', labelKey: 'glucose.beforeMeal' },
  { value: 'after_meal', labelKey: 'glucose.afterMeal' },
  { value: 'fasting', labelKey: 'glucose.fasting' },
];

function isFilterActive(filters: GlucoseFilter): boolean {
  return !!(
    filters.dateFrom ||
    filters.dateTo ||
    filters.levelMin !== undefined ||
    filters.levelMax !== undefined ||
    (filters.levelRanges && filters.levelRanges.length > 0) ||
    (filters.mealRelations && filters.mealRelations.length > 0)
  );
}

function countActiveFilters(filters: GlucoseFilter): number {
  let count = 0;
  if (filters.dateFrom || filters.dateTo) count++;
  if (filters.levelMin !== undefined || filters.levelMax !== undefined || (filters.levelRanges && filters.levelRanges.length > 0)) count++;
  if (filters.mealRelations && filters.mealRelations.length > 0) count++;
  return count;
}

export default function GlucoseListScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const unit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';
  const [exporting, setExporting] = useState(false);
  const { canExportPDF, canAccessUnlimitedHistory } = useSubscription();
  const rootNav = useRootNavigation();
  const historyLimited = !canAccessUnlimitedHistory();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<GlucoseFilter>({});
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);

  const activeFilterCount = countActiveFilters(filters);

  // Compute level filter from selected presets
  const computedFilters = useMemo((): GlucoseFilter => {
    const f = { ...filters };
    if (selectedLevels.length > 0) {
      const presets = LEVEL_PRESETS.filter(p => selectedLevels.includes(p.key));
      f.levelRanges = presets.map(p => ({ min: p.min, max: p.max }));
    }
    // Enforce 30-day history limit for free users
    if (historyLimited) {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      if (!f.dateFrom || f.dateFrom < thirtyDaysAgo) {
        f.dateFrom = thirtyDaysAgo;
      }
    }
    return f;
  }, [filters, selectedLevels, historyLimited]);

  const hasActiveFilters = isFilterActive(computedFilters);

  const toggleFilterPanel = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilters(prev => !prev);
  }, []);

  const toggleLevelPreset = useCallback((key: string) => {
    setSelectedLevels(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const toggleMealRelation = useCallback((meal: MealRelation) => {
    setFilters(prev => {
      const current = prev.mealRelations ?? [];
      const updated = current.includes(meal)
        ? current.filter(m => m !== meal)
        : [...current, meal];
      return { ...prev, mealRelations: updated.length > 0 ? updated : undefined };
    });
  }, []);

  const handleDateFromChange = useCallback((_event: unknown, date?: Date) => {
    setShowDateFrom(false);
    if (date) {
      setFilters(prev => ({ ...prev, dateFrom: date.toISOString() }));
    }
  }, []);

  const handleDateToChange = useCallback((_event: unknown, date?: Date) => {
    setShowDateTo(false);
    if (date) {
      // Set to end of day
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      setFilters(prev => ({ ...prev, dateTo: endOfDay.toISOString() }));
    }
  }, []);

  const clearFilters = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({});
    setSelectedLevels([]);
  }, []);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['glucose', 'list', activePet?.id, computedFilters],
    queryFn: ({ pageParam }) => {
      if (!activePet) return Promise.resolve({ data: [], nextCursor: null });
      if (hasActiveFilters) {
        return glucoseRepository.findByPetIdFiltered(activePet.id, computedFilters, 50, pageParam);
      }
      return glucoseRepository.findByPetId(activePet.id, 50, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!activePet?.id,
  });

  const readings = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);

  const { data: stats } = useQuery({
    queryKey: ['glucose', 'stats', activePet?.id],
    queryFn: () => activePet ? glucoseRepository.getStats(activePet.id) : Promise.resolve({ avg: 0, min: 0, max: 0, count: 0 }),
    enabled: !!activePet?.id,
  });

  const handleDelete = useCallback((id: string) => {
    const allItems = data?.pages.flatMap(p => p.data) ?? [];
    const item = allItems.find(r => r.id === id);
    const displayValue = item
      ? unit === 'mg/dL' ? `${item.valueMgdl}` : `${item.valueMmol.toFixed(1)}`
      : '';
    const info = item
      ? `${formatFullDateTime(item.recordedAt)} — ${displayValue} ${unit}`
      : '';
    Alert.alert(
      t('glucose.deleteConfirm'),
      info || undefined,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await glucoseRepository.delete(id);
              await queryClient.invalidateQueries({ queryKey: ['glucose'] });
              await queryClient.invalidateQueries({ queryKey: ['diary'] });
            } catch {
              Alert.alert(t('common.error'));
            }
          },
        },
      ]
    );
  }, [t, queryClient, data, unit]);

  const mealLabels = useMemo<Record<string, string>>(() => ({
    before_meal: t('glucose.beforeMeal'),
    after_meal: t('glucose.afterMeal'),
    fasting: t('glucose.fasting'),
    unspecified: '',
  }), [t]);

  const handleExportPdf = useCallback(async () => {
    if (!activePet) return;
    if (!canExportPDF()) {
      rootNav.navigate('Paywall');
      return;
    }
    setExporting(true);
    try {
      const [allReadings, injections, symptoms] = await Promise.all([
        glucoseRepository.findAllByPetId(activePet.id),
        injectionRepository.findAllByPetId(activePet.id),
        symptomRepository.findAllByPetId(activePet.id),
      ]);
      await generateVetReportPdf({
        pet: activePet,
        glucoseReadings: allReadings,
        injections,
        symptoms,
      });
    } catch (e) {
      Alert.alert(t('common.error'), String(e));
    } finally {
      setExporting(false);
    }
  }, [activePet, t, rootNav, canExportPDF]);

  const renderReading = useCallback(({ item, index }: { item: GlucoseReading; index: number }) => {
    const displayValue = unit === 'mmol/L' ? `${item.valueMmol.toFixed(1)}` : `${item.valueMgdl}`;
    const color = getGlucoseColor(item.valueMmol);

    return (
      <AnimatedListItem index={index}>
        <TouchableOpacity
          onPress={() => rootNav.navigate('Main', { screen: 'Home', params: { screen: 'LogGlucose', params: { editId: item.id } } })}
          onLongPress={() => handleDelete(item.id)}
          activeOpacity={0.8}
        >
          <Card style={styles.readingCard} shadow>
            <View style={[styles.colorBar, { backgroundColor: color }]} />
            <View style={styles.readingContent}>
              <View>
                <Text style={[styles.readingValue, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                  {displayValue} <Text style={{ fontSize: 14, color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }}>{unit}</Text>
                </Text>
                <Text style={[styles.readingTime, { color: theme.colors.textSecondary, fontFamily: theme.fonts.regular }]}>
                  {formatDateTime(item.recordedAt)}
                  {item.mealRelation !== 'unspecified' ? ` · ${mealLabels[item.mealRelation]}` : ''}
                </Text>
                {item.insulinDose && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                    <Icon name="medkit-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={[styles.readingInsulin, { color: theme.colors.textTertiary, fontFamily: theme.fonts.regular }]}>
                      {item.insulinDose} {t('common.units')} {item.insulinType ?? ''}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }}>
                  <Icon name="trash-outline" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
                <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </AnimatedListItem>
    );
  }, [unit, theme, rootNav, handleDelete, mealLabels, t]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter toggle row */}
      <View style={[styles.filterToggleRow, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterToggleBtn,
            {
              backgroundColor: hasActiveFilters ? theme.colors.primaryLight : theme.colors.surface,
              borderColor: hasActiveFilters ? theme.colors.primary : 'transparent',
              borderWidth: 1.5,
            },
          ]}
          onPress={toggleFilterPanel}
          activeOpacity={0.7}
        >
          <Icon
            name={showFilters ? 'filter' : 'filter-outline'}
            size={18}
            color={hasActiveFilters ? theme.colors.primary : theme.colors.text}
          />
          <Text style={[styles.filterToggleText, { color: hasActiveFilters ? theme.colors.primary : theme.colors.text }]}>
            {t('glucose.filters')}
          </Text>
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <Card style={[styles.filterPanel, { borderColor: theme.colors.border }]} shadow={false}>
          {/* Date range */}
          <Text style={[styles.filterSectionLabel, { color: theme.colors.textSecondary }]}>
            {t('glucose.date')}
          </Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDateFrom(true)}
            >
              <Text style={{ color: filters.dateFrom ? theme.colors.text : theme.colors.textTertiary, fontSize: 14 }}>
                {filters.dateFrom ? formatFullDate(filters.dateFrom) : t('glucose.filterFrom')}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: theme.colors.textTertiary }}>—</Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDateTo(true)}
            >
              <Text style={{ color: filters.dateTo ? theme.colors.text : theme.colors.textTertiary, fontSize: 14 }}>
                {filters.dateTo ? formatFullDate(filters.dateTo) : t('glucose.filterTo')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDateFrom && (
            <DateTimePicker
              value={filters.dateFrom ? new Date(filters.dateFrom) : new Date()}
              mode="date"
              onChange={handleDateFromChange}
              maximumDate={filters.dateTo ? new Date(filters.dateTo) : new Date()}
            />
          )}
          {showDateTo && (
            <DateTimePicker
              value={filters.dateTo ? new Date(filters.dateTo) : new Date()}
              mode="date"
              onChange={handleDateToChange}
              minimumDate={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
              maximumDate={new Date()}
            />
          )}

          {/* Level chips */}
          <Text style={[styles.filterSectionLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            {t('glucose.allLevels')}
          </Text>
          <View style={styles.chipRow}>
            {LEVEL_PRESETS.map(preset => {
              const selected = selectedLevels.includes(preset.key);
              return (
                <TouchableOpacity
                  key={preset.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? preset.color + '22' : theme.colors.surfaceSecondary,
                      borderColor: selected ? preset.color : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => toggleLevelPreset(preset.key)}
                >
                  <View style={[styles.chipDot, { backgroundColor: preset.color }]} />
                  <Text style={[styles.chipText, { color: selected ? preset.color : theme.colors.text }]} numberOfLines={1}>
                    {t(preset.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Meal relation chips */}
          <Text style={[styles.filterSectionLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
            {t('glucose.allMeals')}
          </Text>
          <View style={styles.chipRow}>
            {MEAL_OPTIONS.map(opt => {
              const selected = filters.mealRelations?.includes(opt.value) ?? false;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                      borderColor: selected ? theme.colors.primary : 'transparent',
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={() => toggleMealRelation(opt.value)}
                >
                  <Text style={[styles.chipText, { color: selected ? theme.colors.primary : theme.colors.text }]} numberOfLines={1}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear filters */}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Icon name="close-circle-outline" size={16} color={theme.colors.danger} />
              <Text style={[styles.clearBtnText, { color: theme.colors.danger }]}>
                {t('glucose.clearFilters')}
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Stats Bar */}
      {stats && stats.count > 0 && (
        <Card style={styles.statsCard} shadow={false}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {unit === 'mg/dL' ? mmolToMgdl(stats.avg) : stats.avg.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.average')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {unit === 'mg/dL' ? mmolToMgdl(stats.min) : stats.min.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.min')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>
                {unit === 'mg/dL' ? mmolToMgdl(stats.max) : stats.max.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.max')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.count}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.total')}</Text>
            </View>
          </View>
        </Card>
      )}

      <FlatList
        data={readings}
        keyExtractor={item => item.id}
        renderItem={renderReading}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          readings.length > 0 ? (
            <Text style={[styles.hintText, { color: theme.colors.textTertiary }]}>{t('common.longPressToDelete')}</Text>
          ) : null
        }
        ListFooterComponent={
          <>
            {isFetchingNextPage && (
              <ActivityIndicator style={styles.loadingFooter} size="small" color={theme.colors.primary} />
            )}
            {historyLimited && readings.length > 0 && (
              <TouchableOpacity
                style={[styles.historyBanner, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}
                onPress={() => rootNav.navigate('Paywall')}
                activeOpacity={0.8}
              >
                <Icon name="time-outline" size={16} color={theme.colors.primary} />
                <Text style={[styles.historyBannerText, { color: theme.colors.primary }]}>
                  {t('subscription.historyLimited')}
                </Text>
                <Icon name="chevron-forward" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </>
        }
        ListEmptyComponent={
          hasActiveFilters ? (
            <EmptyState
              iconName="filter-outline"
              iconColor={theme.colors.textTertiary}
              title={t('glucose.noFilterResults')}
              subtitle={t('glucose.tryDifferentFilters')}
              actionLabel={t('glucose.clearFilters')}
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              iconName="water-outline"
              iconColor={theme.colors.primary}
              title={t('glucose.title')}
              subtitle={t('glucose.noReadings')}
              actionLabel={t('glucose.addReading')}
              onAction={() => rootNav.navigate('Main', { screen: 'Home', params: { screen: 'LogGlucose', params: {} } })}
            />
          )
        }
      />

      {/* Export PDF FAB */}
      {readings.length > 0 && (
        <TouchableOpacity
          style={[styles.fabExport, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
          onPress={handleExportPdf}
          activeOpacity={0.8}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Icon name="document-text-outline" size={22} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterToggleRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0.5 },
  filterToggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  filterBadge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  filterPanel: { marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 14, borderWidth: 0.5 },
  filterSectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingVertical: 8 },
  clearBtnText: { fontSize: 14, fontWeight: '600' },
  statsCard: { margin: 16, marginBottom: 0, borderRadius: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', padding: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  list: { padding: 16, gap: 8, paddingBottom: 100 },
  readingCard: { padding: 0, flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 5, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  readingContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  readingValue: { fontSize: 20, fontWeight: '700' },
  readingTime: { fontSize: 13, marginTop: 2 },
  readingInsulin: { fontSize: 12, marginTop: 4 },
  fabExport: { position: 'absolute', bottom: 32, right: 20, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, borderWidth: 1.5 },
  loadingFooter: { paddingVertical: 16 },
  historyBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  historyBannerText: { flex: 1, fontSize: 13, fontWeight: '600' },
  hintText: { fontSize: 12, textAlign: 'center', marginBottom: 8 },
});
