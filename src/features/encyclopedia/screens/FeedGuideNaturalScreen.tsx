import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { NATURAL_FEEDING_GUIDE } from '../data/naturalFoods';
import type { NaturalFood, NaturalFoodCategory, NaturalFoodSuitability } from '../types';

type FilterCat = NaturalFoodCategory | 'all';

const SUITABILITY_COLORS: Record<NaturalFoodSuitability, string> = {
  excellent: '#4CAF50',
  good: '#2196F3',
  moderate: '#FF9800',
  limited: '#F44336',
};

const CATEGORY_ICONS: Record<NaturalFoodCategory, string> = {
  meat: '🥩',
  organ: '🫀',
  fish: '🐟',
  egg: '🥚',
  supplement: '💊',
};

export default function FeedGuideNaturalScreen() {
  const navigation = useEncyclopediaNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const lang = (i18n.language === 'ru' ? 'ru' : 'en') as 'ru' | 'en';
  const guide = NATURAL_FEEDING_GUIDE;

  const [catFilter, setCatFilter] = useState<FilterCat>('all');

  const filteredFoods = useMemo(() => {
    if (catFilter === 'all') return guide.foods;
    return guide.foods.filter(f => f.category === catFilter);
  }, [catFilter, guide.foods]);

  const sections = useMemo(() => {
    const s: { key: string; title: string; data: Array<{ type: string; food?: NaturalFood }> }[] = [
      { key: 'info', title: '', data: [{ type: 'info' }] },
      { key: 'foods', title: t('feedGuide.naturalFood'), data: filteredFoods.length > 0
        ? filteredFoods.map(f => ({ type: 'food', food: f }))
        : [{ type: 'empty' }] },
      { key: 'supplements', title: t('feedGuide.natural.supplements'), data: [{ type: 'supplements' }] },
      { key: 'transition', title: t('feedGuide.natural.transitionTips'), data: [{ type: 'transition' }] },
      { key: 'menu', title: t('feedGuide.natural.sampleMenu'), data: [{ type: 'menu' }] },
    ];
    return s;
  }, [filteredFoods, t]);

  const renderFoodCard = useCallback((food: NaturalFood) => {
    const sColor = SUITABILITY_COLORS[food.suitability];
    return (
      <View style={[styles.foodCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodEmoji}>{CATEGORY_ICONS[food.category]}</Text>
          <View style={styles.foodInfo}>
            <Text style={[styles.foodName, { color: theme.colors.text }]}>{food.name[lang]}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.suitBadge, { backgroundColor: sColor + '18' }]}>
                <View style={[styles.suitDot, { backgroundColor: sColor }]} />
                <Text style={[styles.suitText, { color: sColor }]}>
                  {t(`feedGuide.natural.suitability.${food.suitability}`)}
                </Text>
              </View>
              <View style={[styles.freqBadge, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <Text style={[styles.freqText, { color: theme.colors.textSecondary }]}>
                  {t(`feedGuide.natural.frequency.${food.frequency}`)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>{food.proteinPer100g}g</Text>
            <Text style={[styles.macroLabel, { color: theme.colors.textTertiary }]}>{t('feedGuide.natural.protein')}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>{food.fatPer100g}g</Text>
            <Text style={[styles.macroLabel, { color: theme.colors.textTertiary }]}>{t('feedGuide.natural.fat')}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>{food.carbsPer100g}g</Text>
            <Text style={[styles.macroLabel, { color: theme.colors.textTertiary }]}>{t('feedGuide.natural.carbs')}</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: theme.colors.text }]}>{food.kcalPer100g}</Text>
            <Text style={[styles.macroLabel, { color: theme.colors.textTertiary }]}>kcal</Text>
          </View>
          <Text style={[styles.per100g, { color: theme.colors.textTertiary }]}>
            {t('feedGuide.natural.per100g')}
          </Text>
        </View>

        <View style={styles.tipRow}>
          <Ionicons name="restaurant-outline" size={14} color={theme.colors.primary} />
          <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
            {food.preparationTips[lang]}
          </Text>
        </View>

        {food.warnings && (
          <View style={[styles.warningRow, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="warning-outline" size={14} color="#E65100" />
            <Text style={[styles.warningText, { color: '#E65100' }]}>
              {food.warnings[lang]}
            </Text>
          </View>
        )}

        <Text style={[styles.foodNotes, { color: theme.colors.textSecondary }]}>
          {food.notes[lang]}
        </Text>
      </View>
    );
  }, [lang, t, theme]);

  const renderItem = useCallback(({ item }: { item: { type: string; food?: NaturalFood } }) => {
    if (item.type === 'info') {
      return (
        <View style={styles.infoSection}>
          {/* Disclaimer */}
          <View style={[styles.disclaimerCard, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="alert-circle" size={20} color="#C62828" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.disclaimerTitle, { color: '#C62828' }]}>
                {t('feedGuide.natural.disclaimerTitle')}
              </Text>
              <Text style={[styles.disclaimerText, { color: '#C62828' }]}>
                {guide.disclaimer[lang]}
              </Text>
            </View>
          </View>

          {/* Portion guide */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>
              {t('feedGuide.natural.dailyPortion')}
            </Text>
            <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
              {guide.dailyPortionGuide[lang]}
            </Text>
          </View>

          {/* Breakdown */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <Text style={[styles.infoCardTitle, { color: theme.colors.text }]}>
              {t('feedGuide.natural.portionBreakdown')}
            </Text>
            <Text style={[styles.infoCardText, { color: theme.colors.textSecondary }]}>
              {guide.portionBreakdown[lang]}
            </Text>
          </View>
        </View>
      );
    }

    if (item.type === 'empty') {
      return (
        <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: 20, fontSize: 14 }}>
          {t('feedGuide.noFoodsInRegion')}
        </Text>
      );
    }

    if (item.type === 'food' && item.food) {
      return renderFoodCard(item.food);
    }

    if (item.type === 'supplements') {
      return (
        <View style={[styles.suppCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          {guide.supplements.map((s, i) => (
            <View key={i} style={styles.suppRow}>
              <Text style={[styles.suppName, { color: theme.colors.text }]}>{s.name[lang]}</Text>
              <Text style={[styles.suppDesc, { color: theme.colors.textSecondary }]}>{s.desc[lang]}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (item.type === 'transition') {
      return (
        <View style={[styles.transCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <Text style={[styles.transText, { color: theme.colors.text }]}>{guide.transitionTips[lang]}</Text>
        </View>
      );
    }

    if (item.type === 'menu') {
      return (
        <View style={[styles.menuCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
          <View style={styles.menuRow}>
            <Text style={[styles.menuTime, { color: theme.colors.primary }]}>
              {t('feedGuide.natural.morning')}
            </Text>
            <Text style={[styles.menuText, { color: theme.colors.text }]}>{guide.sampleMenu.morning[lang]}</Text>
          </View>
          <View style={[styles.menuDivider, { borderColor: theme.colors.border }]} />
          <View style={styles.menuRow}>
            <Text style={[styles.menuTime, { color: theme.colors.primary }]}>
              {t('feedGuide.natural.evening')}
            </Text>
            <Text style={[styles.menuText, { color: theme.colors.text }]}>{guide.sampleMenu.evening[lang]}</Text>
          </View>
        </View>
      );
    }

    return null;
  }, [lang, t, theme, guide, renderFoodCard]);

  const categories: FilterCat[] = ['all', 'meat', 'organ', 'fish', 'egg', 'supplement'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('feedGuide.natural.title')}</Text>
      </View>

      <View style={styles.filterRow}>
        {categories.map(c => {
          const isActive = catFilter === c;
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterChip,
                { backgroundColor: isActive ? theme.colors.primary : theme.colors.surface, borderColor: isActive ? theme.colors.primary : theme.colors.border },
              ]}
              onPress={() => setCatFilter(c)}
            >
              {c !== 'all' && <Text style={{ fontSize: 13 }}>{CATEGORY_ICONS[c]}</Text>}
              <Text style={{ color: isActive ? '#fff' : theme.colors.text, fontSize: 12, fontWeight: '500' }}>
                {t(`feedGuide.natural.category.${c}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type === 'food' && item.food ? item.food.id : `${item.type}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => {
          if (!section.title) return null;
          return (
            <Text style={[styles.sectionHeader, { color: theme.colors.text, backgroundColor: theme.colors.background }]}>
              {section.title}
            </Text>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backButton: { padding: 4, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingBottom: 8, flexWrap: 'wrap' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  list: { padding: 16, paddingBottom: 100 },
  sectionHeader: { fontSize: 17, fontWeight: '700', paddingVertical: 8 },
  infoSection: { gap: 10, marginBottom: 8 },
  disclaimerCard: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, alignItems: 'flex-start' },
  disclaimerTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  disclaimerText: { fontSize: 13, lineHeight: 19 },
  infoCard: { padding: 14, borderRadius: 12 },
  infoCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  infoCardText: { fontSize: 14, lineHeight: 20 },
  foodCard: { padding: 14, borderRadius: 14, marginBottom: 10, gap: 8 },
  foodHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  foodEmoji: { fontSize: 28, marginTop: 2 },
  foodInfo: { flex: 1, gap: 6 },
  foodName: { fontSize: 16, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  suitBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  suitDot: { width: 7, height: 7, borderRadius: 4 },
  suitText: { fontSize: 12, fontWeight: '600' },
  freqBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  freqText: { fontSize: 12, fontWeight: '500' },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 15, fontWeight: '700' },
  macroLabel: { fontSize: 10, marginTop: 1 },
  per100g: { fontSize: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, borderRadius: 10 },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  foodNotes: { fontSize: 13, lineHeight: 18 },
  suppCard: { padding: 14, borderRadius: 14, gap: 12, marginBottom: 10 },
  suppRow: { gap: 2 },
  suppName: { fontSize: 14, fontWeight: '700' },
  suppDesc: { fontSize: 13, lineHeight: 18 },
  transCard: { padding: 14, borderRadius: 14, marginBottom: 10 },
  transText: { fontSize: 14, lineHeight: 22 },
  menuCard: { padding: 14, borderRadius: 14, gap: 10, marginBottom: 10 },
  menuRow: { gap: 4 },
  menuTime: { fontSize: 13, fontWeight: '700' },
  menuText: { fontSize: 14, lineHeight: 20 },
  menuDivider: { borderBottomWidth: 1 },
});
