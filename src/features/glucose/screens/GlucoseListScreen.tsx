import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlucoseNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { glucoseRepository, injectionRepository, symptomRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { GlucoseReading, getGlucoseColor, MealRelation } from '../types';
import { GlucoseFilter } from '@storage/domain/types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card, AnimatedListItem } from '@shared/components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { generateVetReportPdf } from '@shared/utils/pdfExport';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type LevelPreset = { key: string; labelKey: string; min?: number; max?: number; color: string };

const LEVEL_PRESETS: LevelPreset[] = [
  { key: 'low', labelKey: 'glucose.low', max: 4, color: '#FF3B30' },
  { key: 'normal', labelKey: 'glucose.normal', min: 4, max: 9, color: '#34C759' },
  { key: 'high', labelKey: 'glucose.high', min: 9, max: 14, color: '#FF9500' },
  { key: 'veryHigh', labelKey: 'glucose.veryHigh', min: 14, color: '#FF3B30' },
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
  const navigation = useGlucoseNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const unit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<GlucoseFilter>({});
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showDateFrom, setShowDateFrom] = useState(false);
  const [showDateTo, setShowDateTo] = useState(false);

  const filtersActive = isFilterActive(filters);
  const activeFilterCount = countActiveFilters(filters);

  // Compute level filter from selected presets
  const computedFilters = useMemo((): GlucoseFilter => {
    const f = { ...filters };
    if (selectedLevels.length > 0) {
      const presets = LEVEL_PRESETS.filter(p => selectedLevels.includes(p.key));
      f.levelRanges = presets.map(p => ({ min: p.min, max: p.max }));
    }
    return f;
  }, [filters, selectedLevels]);

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

  const handleDateFromChange = useCallback((_event: any, date?: Date) => {
    setShowDateFrom(false);
    if (date) {
      setFilters(prev => ({ ...prev, dateFrom: date.toISOString() }));
    }
  }, []);

  const handleDateToChange = useCallback((_event: any, date?: Date) => {
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
    isLoading,
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

  const readings = data?.pages.flatMap(p => p.data) ?? [];

  const { data: stats } = useQuery({
    queryKey: ['glucose', 'stats', activePet?.id],
    queryFn: () => activePet ? glucoseRepository.getStats(activePet.id) : Promise.resolve({ avg: 0, min: 0, max: 0, count: 0 }),
    enabled: !!activePet?.id,
  });

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      t('glucose.deleteConfirm'),
      undefined,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await glucoseRepository.delete(id);
            queryClient.invalidateQueries({ queryKey: ['glucose'] });
          },
        },
      ]
    );
  }, [t, queryClient]);

  const mealLabels: Record<string, string> = {
    before_meal: t('glucose.beforeMeal'),
    after_meal: t('glucose.afterMeal'),
    fasting: t('glucose.fasting'),
    unspecified: '',
  };

  const handleExportPdf = useCallback(async () => {
    if (!activePet) return;
    setExporting(true);
    try {
      const [injectionsResult, symptomsResult] = await Promise.all([
        injectionRepository.findByPetId(activePet.id),
        symptomRepository.findByPetId(activePet.id),
      ]);
      const injections = injectionsResult.data;
      const symptoms = symptomsResult.data;
      await generateVetReportPdf({
        pet: activePet,
        glucoseReadings: readings,
        injections,
        symptoms,
      });
    } catch (e) {
      Alert.alert(t('common.error'), String(e));
    } finally {
      setExporting(false);
    }
  }, [activePet, readings, t]);

  const renderReading = useCallback(({ item, index }: { item: GlucoseReading; index: number }) => {
    const displayValue = unit === 'mmol/L' ? `${item.valueMmol.toFixed(1)}` : `${item.valueMgdl}`;
    const color = getGlucoseColor(item.valueMmol);

    return (
      <AnimatedListItem index={index}>
        <TouchableOpacity
          onPress={() => navigation.navigate('LogGlucose', { editId: item.id })}
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
                    <Ionicons name="medkit-outline" size={12} color={theme.colors.textTertiary} />
                    <Text style={[styles.readingInsulin, { color: theme.colors.textTertiary, fontFamily: theme.fonts.regular }]}>
                      {item.insulinDose} ед. {item.insulinType ?? ''}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </View>
          </Card>
        </TouchableOpacity>
      </AnimatedListItem>
    );
  }, [unit, theme, navigation, handleDelete, mealLabels]);

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
          <Ionicons
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
                {filters.dateFrom ? format(new Date(filters.dateFrom), 'dd.MM.yyyy') : t('glucose.filterFrom')}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: theme.colors.textTertiary }}>—</Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDateTo(true)}
            >
              <Text style={{ color: filters.dateTo ? theme.colors.text : theme.colors.textTertiary, fontSize: 14 }}>
                {filters.dateTo ? format(new Date(filters.dateTo), 'dd.MM.yyyy') : t('glucose.filterTo')}
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
                  <Text style={[styles.chipText, { color: selected ? preset.color : theme.colors.text }]}>
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
                  <Text style={[styles.chipText, { color: selected ? theme.colors.primary : theme.colors.text }]}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear filters */}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Ionicons name="close-circle-outline" size={16} color={theme.colors.danger} />
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
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.avg.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.average')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.min.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.min')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>{stats.max.toFixed(1)}</Text>
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loadingFooter} size="small" color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="water-outline"
            iconColor={theme.colors.primary}
            title={t('glucose.title')}
            subtitle={t('glucose.noReadings')}
            actionLabel={t('glucose.addReading')}
            onAction={() => navigation.navigate('LogGlucose', {})}
          />
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
            <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('LogGlucose', {})}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fab, theme.shadows.primarySm]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
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
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabExport: { position: 'absolute', bottom: 90, right: 20, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, borderWidth: 1.5 },
  loadingFooter: { paddingVertical: 16 },
});
