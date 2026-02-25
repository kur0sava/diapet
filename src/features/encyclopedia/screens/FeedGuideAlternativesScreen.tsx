import React, { useMemo, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { ALTERNATIVE_FOODS } from '../data/alternativeFoods';
import type { AlternativeFood, AlternativeFoodVerdict } from '../types';

const VERDICT_COLORS: Record<AlternativeFoodVerdict, string> = {
  recommended: '#4CAF50',
  acceptable: '#FF9800',
  conditional: '#F44336',
};

type FilterVerdict = AlternativeFoodVerdict | 'all';

export default function FeedGuideAlternativesScreen() {
  const navigation = useEncyclopediaNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isRu = i18n.language === 'ru';

  const [filter, setFilter] = useState<FilterVerdict>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return ALTERNATIVE_FOODS;
    return ALTERNATIVE_FOODS.filter(f => f.verdict === filter);
  }, [filter]);

  const renderCard = useCallback(({ item }: { item: AlternativeFood }) => {
    const verdictColor = VERDICT_COLORS[item.verdict];
    const notes = isRu ? item.verdictNotes.ru : item.verdictNotes.en;

    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={[styles.brand, { color: theme.colors.textSecondary }]}>{item.brand}</Text>
            <Text style={[styles.product, { color: theme.colors.text }]}>
              {isRu && item.nameRu ? item.nameRu : item.product}
            </Text>
          </View>
          {item.carbsDM != null && (
            <View style={[styles.carbsBadge, { backgroundColor: verdictColor + '20', borderColor: verdictColor }]}>
              <Text style={[styles.carbsValue, { color: verdictColor }]}>{item.carbsDM}%</Text>
              <Text style={[styles.carbsLabel, { color: verdictColor }]}>{t('feedGuide.carbsDM')}</Text>
            </View>
          )}
        </View>

        <View style={[styles.verdictBadge, { backgroundColor: verdictColor + '18' }]}>
          <View style={[styles.verdictDot, { backgroundColor: verdictColor }]} />
          <Text style={[styles.verdictText, { color: verdictColor }]}>
            {t(`feedGuide.verdict.${item.verdict}`)}
          </Text>
        </View>

        <View style={styles.macroRow}>
          {item.proteinDM != null && (
            <Text style={[styles.macroText, { color: theme.colors.textSecondary }]}>
              {t('feedGuide.proteinDM')}: {item.proteinDM}%
            </Text>
          )}
          {item.fatDM != null && (
            <Text style={[styles.macroText, { color: theme.colors.textSecondary }]}>
              {t('feedGuide.fatDM')}: {item.fatDM}%
            </Text>
          )}
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'wet' ? '#E3F2FD' : item.type === 'both' ? '#E8F5E9' : '#FFF3E0' }]}>
            <Text style={{ fontSize: 11, color: item.type === 'wet' ? '#1565C0' : item.type === 'both' ? '#2E7D32' : '#E65100' }}>
              {item.type === 'wet' ? t('feedGuide.wet') : item.type === 'both' ? t('feedGuide.wet') + ' + ' + t('feedGuide.dry') : t('feedGuide.dry')}
            </Text>
          </View>
        </View>

        <Text style={[styles.notes, { color: theme.colors.text }]}>{notes}</Text>

        {item.regions.length > 0 && (
          <Text style={[styles.regions, { color: theme.colors.textTertiary }]}>
            {item.regions.map(r => t(`feedGuide.regions.${r}`)).join(' • ')}
          </Text>
        )}

        {item.source && (
          <View style={styles.sourceRow}>
            <Ionicons name="link-outline" size={12} color={theme.colors.textTertiary} />
            <Text style={[styles.sourceText, { color: theme.colors.textTertiary }]}>
              {t('feedGuide.source')}: {item.source}
            </Text>
          </View>
        )}
      </View>
    );
  }, [isRu, t, theme]);

  const verdicts: FilterVerdict[] = ['all', 'recommended', 'acceptable', 'conditional'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('feedGuide.alternatives')}</Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name="information-circle" size={18} color={theme.colors.primary} />
        <Text style={[styles.infoText, { color: theme.colors.primary }]}>
          {t('feedGuide.alternativesInfo')}
        </Text>
      </View>

      <View style={styles.filterRow}>
        {verdicts.map(v => {
          const isActive = filter === v;
          const color = v !== 'all' ? VERDICT_COLORS[v] : theme.colors.primary;
          return (
            <TouchableOpacity
              key={v}
              style={[
                styles.filterChip,
                { backgroundColor: isActive ? color + '20' : theme.colors.surface, borderColor: isActive ? color : theme.colors.border },
              ]}
              onPress={() => setFilter(v)}
            >
              {v !== 'all' && <View style={[styles.filterDot, { backgroundColor: color }]} />}
              <Text style={{ color: isActive ? color : theme.colors.text, fontSize: 12, fontWeight: '600' }}>
                {v === 'all' ? t('feedGuide.all') : t(`feedGuide.verdict.${v}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backButton: { padding: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, padding: 12, borderRadius: 12, marginBottom: 8 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, paddingBottom: 8, flexWrap: 'wrap' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  list: { padding: 16, paddingBottom: 100, gap: 10 },
  card: { padding: 14, borderRadius: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: 10 },
  brand: { fontSize: 12, fontWeight: '500' },
  product: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  carbsBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  carbsValue: { fontSize: 16, fontWeight: '800' },
  carbsLabel: { fontSize: 9, fontWeight: '500', marginTop: 1 },
  verdictBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  verdictDot: { width: 8, height: 8, borderRadius: 4 },
  verdictText: { fontSize: 13, fontWeight: '600' },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  macroText: { fontSize: 12 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  notes: { fontSize: 13, lineHeight: 19 },
  regions: { fontSize: 12 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sourceText: { fontSize: 11 },
});
