import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, FlatList,
  TouchableOpacity, TextInput, SafeAreaView,
} from 'react-native';
import { Icon } from '@shared/components/ui/Icon';
import { useTranslation } from 'react-i18next';
import i18n from '@shared/i18n';
import { useTheme } from '@shared/theme';
import { ALL_FOODS } from '@features/encyclopedia/data/diabeticFoods';
import { ALTERNATIVE_FOODS } from '@features/encyclopedia/data/alternativeFoods';
import { NATURAL_FEEDING_GUIDE } from '@features/encyclopedia/data/naturalFoods';

export interface SelectedFoodData {
  foodBrand: string;
  foodProduct: string;
  protein?: number;
  fat?: number;
  fiber?: number;
  ash?: number;
  moisture?: number;
  carbsDM?: number;
  verdict?: string;
  isNatural?: boolean;
}

type UnifiedFood = {
  id: string;
  brand: string;
  product: string;
  carbsDM?: number;
  verdict?: string;
  category: 'prescription' | 'veterinary' | 'otc' | 'alternative' | 'natural';
};

function buildUnifiedList(): UnifiedFood[] {
  const lang = i18n.language;
  const items: UnifiedFood[] = [];

  for (const f of ALL_FOODS) {
    items.push({
      id: f.id,
      brand: f.brand,
      product: lang === 'ru' && f.nameRu ? f.nameRu : f.product,
      carbsDM: f.carbsDM,
      verdict: f.carbsDM !== undefined ? (f.carbsDM < 10 ? 'good' : f.carbsDM <= 15 ? 'acceptable' : 'bad') : undefined,
      category: f.category === 'prescription' ? 'prescription' : 'otc',
    });
  }

  for (const f of ALTERNATIVE_FOODS) {
    items.push({
      id: f.id,
      brand: f.brand,
      product: lang === 'ru' && f.nameRu ? f.nameRu : f.product,
      carbsDM: f.carbsDM,
      verdict: f.verdict === 'recommended' ? 'good' : f.verdict === 'acceptable' ? 'acceptable' : 'acceptable',
      category: 'alternative',
    });
  }

  for (const f of NATURAL_FEEDING_GUIDE.foods) {
    items.push({
      id: f.id,
      brand: lang === 'ru' ? f.name.ru : f.name.en,
      product: '',
      carbsDM: f.carbsPer100g,
      verdict: f.suitability === 'excellent' || f.suitability === 'good' ? 'good' : 'acceptable',
      category: 'natural',
    });
  }

  return items;
}

function getFoodNutrition(id: string): SelectedFoodData | null {
  const lang = i18n.language;

  const diabeticFood = ALL_FOODS.find(f => f.id === id);
  if (diabeticFood) {
    return {
      foodBrand: diabeticFood.brand,
      foodProduct: lang === 'ru' && diabeticFood.nameRu ? diabeticFood.nameRu : diabeticFood.product,
      carbsDM: diabeticFood.carbsDM,
      verdict: diabeticFood.carbsDM !== undefined ? (diabeticFood.carbsDM < 10 ? 'good' : diabeticFood.carbsDM <= 15 ? 'acceptable' : 'bad') : undefined,
    };
  }

  const altFood = ALTERNATIVE_FOODS.find(f => f.id === id);
  if (altFood) {
    return {
      foodBrand: altFood.brand,
      foodProduct: lang === 'ru' && altFood.nameRu ? altFood.nameRu : altFood.product,
      carbsDM: altFood.carbsDM,
      verdict: altFood.verdict === 'recommended' ? 'good' : 'acceptable',
    };
  }

  const natural = NATURAL_FEEDING_GUIDE.foods.find(f => f.id === id);
  if (natural) {
    return {
      foodBrand: lang === 'ru' ? natural.name.ru : natural.name.en,
      foodProduct: '',
      carbsDM: natural.carbsPer100g,
      verdict: natural.suitability === 'excellent' || natural.suitability === 'good' ? 'good' : 'acceptable',
      isNatural: true,
    };
  }

  return null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (data: SelectedFoodData) => void;
  filterCategory?: 'natural' | 'commercial';
}

const CATEGORY_ORDER: UnifiedFood['category'][] = ['prescription', 'otc', 'alternative', 'natural'];

export default function FoodSelector({ visible, onClose, onSelect, filterCategory }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const allFoods = useMemo(() => buildUnifiedList(), []);

  const filtered = useMemo(() => {
    let items = allFoods;
    if (filterCategory === 'natural') {
      items = items.filter(f => f.category === 'natural');
    } else if (filterCategory === 'commercial') {
      items = items.filter(f => f.category !== 'natural');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f =>
        f.brand.toLowerCase().includes(q) || f.product.toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  }, [allFoods, search, filterCategory]);

  const categoryLabel = (cat: UnifiedFood['category']): string => {
    const labels: Record<string, string> = {
      prescription: t('feeding.catPrescription', { defaultValue: i18n.language === 'ru' ? 'Рецептурные' : 'Prescription' }),
      otc: t('feeding.catOtc', { defaultValue: i18n.language === 'ru' ? 'Низкоуглеводные' : 'Low-carb' }),
      alternative: t('feeding.catAlternative', { defaultValue: i18n.language === 'ru' ? 'Альтернативные' : 'Alternative' }),
      natural: t('feeding.catNatural', { defaultValue: i18n.language === 'ru' ? 'Натуральные' : 'Natural' }),
    };
    return labels[cat] ?? cat;
  };

  const verdictColor = (v?: string) => {
    if (v === 'good') return '#34C759';
    if (v === 'acceptable') return '#FF9500';
    return '#FF3B30';
  };

  const handleSelect = (item: UnifiedFood) => {
    const data = getFoodNutrition(item.id);
    if (data) {
      onSelect(data);
    }
    onClose();
  };

  let lastCategory: string | null = null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modal, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('feeding.selectFood', { defaultValue: i18n.language === 'ru' ? 'Выбрать корм' : 'Select food' })}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchRow, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Icon name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={t('common.search', { defaultValue: i18n.language === 'ru' ? 'Поиск...' : 'Search...' })}
            placeholderTextColor={theme.colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const showHeader = item.category !== lastCategory;
            lastCategory = item.category;
            return (
              <>
                {showHeader && (
                  <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                    {categoryLabel(item.category)}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.foodItem, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.foodBrand, { color: theme.colors.text }]} numberOfLines={1}>
                      {item.brand}
                    </Text>
                    {item.product ? (
                      <Text style={[styles.foodProduct, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                        {item.product}
                      </Text>
                    ) : null}
                  </View>
                  {item.carbsDM !== undefined && (
                    <View style={[styles.carbsBadge, { backgroundColor: `${verdictColor(item.verdict)}20` }]}>
                      <Text style={[styles.carbsText, { color: verdictColor(item.verdict) }]}>
                        {item.carbsDM.toFixed(0)}% {i18n.language === 'ru' ? 'угл.' : 'carbs'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              {t('glucose.noFilterResults', { defaultValue: i18n.language === 'ru' ? 'Ничего не найдено' : 'No results' })}
            </Text>
          }
        />

        <TouchableOpacity
          style={[styles.manualBtn, { backgroundColor: theme.colors.primaryLight }]}
          onPress={() => {
            onSelect({ foodBrand: '', foodProduct: '' });
            onClose();
          }}
        >
          <Icon name="create-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.manualBtnText, { color: theme.colors.primary }]}>
            {t('feeding.manualNutrition', { defaultValue: i18n.language === 'ru' ? 'Ввести вручную' : 'Enter manually' })}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 12, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  sectionHeader: { fontSize: 13, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6, textTransform: 'uppercase' },
  foodItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 12, marginBottom: 6, borderRadius: 10, gap: 12 },
  foodBrand: { fontSize: 15, fontWeight: '600' },
  foodProduct: { fontSize: 13, marginTop: 2 },
  carbsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  carbsText: { fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  manualBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, padding: 14, borderRadius: 12 },
  manualBtnText: { fontSize: 15, fontWeight: '600' },
});
