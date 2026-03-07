import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import type { EncyclopediaStackScreenProps } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  getPrescriptionFoods, getOtcFoods, getFoodsByCarbs,
  getFoodVerdict, VALID_REGIONS, type Region, type DiabeticCatFood,
} from '../data/diabeticFoods';
import { getStoresForRegion } from '../data/regionStores';
import type { StoreEntry } from '../types';

type FilterType = 'all' | 'wet' | 'dry';

const STORE_TYPE_ICONS: Record<string, string> = {
  online: 'globe-outline',
  retail: 'storefront-outline',
  vet_pharmacy: 'medkit-outline',
  marketplace: 'cart-outline',
};

const VERDICT_COLORS: Record<string, string> = {
  good: '#4CAF50',
  acceptable: '#FF9800',
  bad: '#F44336',
};

export default function FeedGuideRegionScreen() {
  const route = useRoute<EncyclopediaStackScreenProps<'FeedGuideRegion'>['route']>();
  const navigation = useEncyclopediaNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const rawRegion = route.params.region;
  const region: Region = (VALID_REGIONS as readonly string[]).includes(rawRegion) ? rawRegion as Region : 'GLOBAL';
  const isRu = i18n.language === 'ru';

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortByCarbs, setSortByCarbs] = useState(false);

  const regionStoreInfo = useMemo(() => getStoresForRegion(region), [region]);

  const filterFoods = useCallback((foods: DiabeticCatFood[]) => {
    let result = foods;
    if (filter !== 'all') {
      result = result.filter(f => f.type === filter || f.type === 'both');
    }
    if (sortByCarbs) {
      result = getFoodsByCarbs(result);
    }
    return result;
  }, [filter, sortByCarbs]);

  const prescriptionFoods = useMemo(
    () => filterFoods(getPrescriptionFoods(region)),
    [region, filterFoods],
  );
  const otcFoods = useMemo(
    () => filterFoods(getOtcFoods(region)),
    [region, filterFoods],
  );

  const sections = useMemo(() => {
    const s = [];
    if (regionStoreInfo && regionStoreInfo.stores.length > 0) {
      s.push({ key: 'stores', title: t('feedGuide.storesIn'), data: [{ type: 'stores' as const }] });
    }
    if (prescriptionFoods.length > 0) {
      s.push({ key: 'prescription', title: t('feedGuide.prescriptionFoods'), data: prescriptionFoods.map(f => ({ type: 'food' as const, food: f })) });
    }
    if (otcFoods.length > 0) {
      s.push({ key: 'otc', title: t('feedGuide.otcFoods'), data: otcFoods.map(f => ({ type: 'food' as const, food: f })) });
    }
    if (prescriptionFoods.length === 0 && otcFoods.length === 0) {
      s.push({ key: 'empty', title: '', data: [{ type: 'empty' as const }] });
    }
    return s;
  }, [regionStoreInfo, prescriptionFoods, otcFoods, t]);

  const renderStoreChip = (store: StoreEntry) => (
    <View key={store.id} style={[styles.storeChip, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <Ionicons name={STORE_TYPE_ICONS[store.type] as string} size={16} color={theme.colors.primary} />
      <Text style={[styles.storeName, { color: theme.colors.text }]}>
        {isRu && store.nameRu ? store.nameRu : store.name}
      </Text>
      <View style={[styles.storeTypeBadge, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={[styles.storeTypeText, { color: theme.colors.primary }]}>
          {t(`feedGuide.storeType.${store.type}`)}
        </Text>
      </View>
    </View>
  );

  const renderFoodCard = (food: DiabeticCatFood) => {
    const verdict = food.carbsDM != null ? getFoodVerdict(food.carbsDM) : null;
    const verdictColor = verdict ? VERDICT_COLORS[verdict] : theme.colors.textTertiary;
    const buyList = food.whereToBuy?.[region] ?? [];

    return (
      <View style={[styles.foodCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
        <View style={styles.foodHeader}>
          <View style={styles.foodInfo}>
            <Text style={[styles.foodBrand, { color: theme.colors.textSecondary }]}>{food.brand}</Text>
            <Text style={[styles.foodProduct, { color: theme.colors.text }]}>
              {isRu && food.nameRu ? food.nameRu : food.product}
            </Text>
          </View>
          {food.carbsDM != null && (
            <View style={[styles.carbsBadge, { backgroundColor: verdictColor + '20', borderColor: verdictColor }]}>
              <Text style={[styles.carbsValue, { color: verdictColor }]}>{food.carbsDM}%</Text>
              <Text style={[styles.carbsLabel, { color: verdictColor }]}>{t('feedGuide.carbsDM')}</Text>
            </View>
          )}
        </View>

        <View style={styles.macroRow}>
          {food.proteinDM != null && (
            <Text style={[styles.macroText, { color: theme.colors.textSecondary }]}>
              {t('feedGuide.proteinDM')}: {food.proteinDM}%
            </Text>
          )}
          {food.fatDM != null && (
            <Text style={[styles.macroText, { color: theme.colors.textSecondary }]}>
              {t('feedGuide.fatDM')}: {food.fatDM}%
            </Text>
          )}
          <View style={[styles.typeBadge, { backgroundColor: food.type === 'wet' ? '#E3F2FD' : '#FFF3E0' }]}>
            <Text style={{ fontSize: 11, color: food.type === 'wet' ? '#1565C0' : '#E65100' }}>
              {food.type === 'wet' ? t('feedGuide.wet') : food.type === 'dry' ? t('feedGuide.dry') : t('feedGuide.all')}
            </Text>
          </View>
        </View>

        {food.prescriptionRequired && (
          <View style={styles.prescriptionRow}>
            <Ionicons name="document-text-outline" size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.prescriptionText, { color: theme.colors.textTertiary }]}>
              {t('feedGuide.prescriptionRequired')}
            </Text>
          </View>
        )}

        {food.notes && (
          <Text style={[styles.foodNotes, { color: theme.colors.textSecondary }]}>{food.notes}</Text>
        )}

        {buyList.length > 0 && (
          <View style={styles.buyRow}>
            <Ionicons name="bag-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.buyText, { color: theme.colors.primary }]} numberOfLines={2}>
              {buyList.join(' • ')}
            </Text>
          </View>
        )}

        {food.priceHint && (
          <Text style={[styles.priceHint, { color: theme.colors.textTertiary }]}>{food.priceHint}</Text>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: { type: string; food?: DiabeticCatFood } }) => {
    if (item.type === 'stores' && regionStoreInfo) {
      return (
        <View style={styles.storesContainer}>
          {regionStoreInfo.stores.map(renderStoreChip)}
        </View>
      );
    }
    if (item.type === 'food' && item.food) {
      return renderFoodCard(item.food);
    }
    if (item.type === 'empty') {
      return (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {t('feedGuide.noFoodsInRegion')}
        </Text>
      );
    }
    return null;
  };

  const filters: FilterType[] = ['all', 'wet', 'dry'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t(`feedGuide.regions.${region}`)}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              { backgroundColor: filter === f ? theme.colors.primary : theme.colors.surface, borderColor: filter === f ? theme.colors.primary : theme.colors.border },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={{ color: filter === f ? '#fff' : theme.colors.text, fontSize: 13, fontWeight: '500' }}>
              {f === 'all' ? t('feedGuide.all') : f === 'wet' ? t('feedGuide.wet') : t('feedGuide.dry')}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: sortByCarbs ? theme.colors.primary : theme.colors.surface, borderColor: sortByCarbs ? theme.colors.primary : theme.colors.border },
          ]}
          onPress={() => setSortByCarbs(!sortByCarbs)}
        >
          <Ionicons name="arrow-up" size={14} color={sortByCarbs ? '#fff' : theme.colors.text} />
          <Text style={{ color: sortByCarbs ? '#fff' : theme.colors.text, fontSize: 13, fontWeight: '500' }}>
            {t('feedGuide.sortByCarbs')}
          </Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type === 'food' && item.food ? item.food.id : `s-${index}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.colors.text, backgroundColor: theme.colors.background }]}>
            {section.title}
          </Text>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('feedGuide.noFoodsInRegion')}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12 },
  backButton: { padding: 4, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  list: { padding: 16, paddingBottom: 100 },
  sectionHeader: { fontSize: 17, fontWeight: '700', paddingVertical: 8 },
  storesContainer: { gap: 8, marginBottom: 8 },
  storeChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  storeName: { flex: 1, fontSize: 14, fontWeight: '600' },
  storeTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  storeTypeText: { fontSize: 11, fontWeight: '500' },
  foodCard: { padding: 14, borderRadius: 14, marginBottom: 10, gap: 8 },
  foodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  foodInfo: { flex: 1, marginRight: 10 },
  foodBrand: { fontSize: 12, fontWeight: '500' },
  foodProduct: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  carbsBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  carbsValue: { fontSize: 16, fontWeight: '800' },
  carbsLabel: { fontSize: 9, fontWeight: '500', marginTop: 1 },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  macroText: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  prescriptionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prescriptionText: { fontSize: 12 },
  foodNotes: { fontSize: 13, lineHeight: 18 },
  buyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  buyText: { flex: 1, fontSize: 12 },
  priceHint: { fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});
