import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import {
  DIABETIC_NUTRITION_GUIDELINES_CAT,
  DIABETIC_NUTRITION_GUIDELINES_DOG,
  type Region,
} from '../data/diabeticFoods';
import { usePetStore } from '@shared/stores/petStore';
import { getAppRegion } from '@shared/config/regionConfig';

const REGIONS: { key: Region; emoji: string }[] = [
  { key: 'RU', emoji: '🇷🇺' },
  { key: 'US', emoji: '🇺🇸' },
  { key: 'EU', emoji: '🇪🇺' },
  { key: 'DE', emoji: '🇩🇪' },
  { key: 'UK', emoji: '🇬🇧' },
  { key: 'MX', emoji: '🇲🇽' },
];

export default function FeedGuideScreen() {
  const navigation = useEncyclopediaNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const lang = i18n.language === 'ru' ? 'ru' : 'en';
  const species = usePetStore(s => s.activePet?.species ?? 'cat');
  // Feeding tips differ by species: cats → low-carb; dogs → high-fiber + low-fat
  // (pancreatitis risk). Using cat tips for a dog user would give wrong advice.
  const tips =
    species === 'dog'
      ? DIABETIC_NUTRITION_GUIDELINES_DOG.feedingTips[lang]
      : DIABETIC_NUTRITION_GUIDELINES_CAT.feedingTips[lang];
  // Natural feeding guide is cat-only (taurine, protein ratios). Hide for dogs
  // to avoid species-wrong advice; will be re-enabled when dog natural guide lands.
  const showNaturalFood = species !== 'dog';
  // 6.1 (audit): every entry in alternativeFoods.ts is feline (no species tag →
  // defaults to 'cat'), so a dog owner opening "Alternatives" saw an empty list.
  // Hide the card for dogs until dog alternatives are authored (content backlog).
  const showAlternatives = species !== 'dog';
  // User's region first in the grid, marked as "yours" — one tap to their
  // local catalog instead of scanning the list every time.
  const appRegion = getAppRegion();
  // Batch7: getAppRegion() falls back to 'GLOBAL' for many locales, but the grid
  // listed only country regions — a GLOBAL user couldn't reach the GLOBAL catalog.
  // Surface a GLOBAL entry (at the top, marked "yours") only for those users.
  const baseRegions: { key: Region; emoji: string }[] =
    appRegion === 'GLOBAL' ? [{ key: 'GLOBAL', emoji: '🌍' }, ...REGIONS] : REGIONS;
  const orderedRegions = [
    ...baseRegions.filter(r => r.key === appRegion),
    ...baseRegions.filter(r => r.key !== appRegion),
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('feedGuide.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('feedGuide.subtitle')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: theme.colors.primaryLight }]}>
          <Icon name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.disclaimerText, { color: theme.colors.primary }]}>
            {t('feedGuide.disclaimer')}
          </Text>
        </View>

        {/* Where to Buy */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('feedGuide.whereToBuy')}
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
          {t('feedGuide.whereToBuyDesc')}
        </Text>
        <View style={styles.regionGrid}>
          {orderedRegions.map(({ key, emoji }) => {
            const isYours = key === appRegion;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.regionChip,
                  { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
                  isYours && { borderWidth: 1.5, borderColor: theme.colors.primary },
                ]}
                onPress={() => navigation.navigate('FeedGuideRegion', { region: key })}
                activeOpacity={0.7}
              >
                <Text style={styles.regionEmoji}>{emoji}</Text>
                <Text style={[styles.regionLabel, { color: theme.colors.text }]}>
                  {t(`feedGuide.regions.${key}`)}
                </Text>
                {isYours && (
                  <View style={[styles.yourBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text style={[styles.yourBadgeText, { color: theme.colors.primary }]}>
                      {t('feedGuide.yourRegion')}
                    </Text>
                  </View>
                )}
                <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Portion Calculator (tool) */}
        <TouchableOpacity
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
          ]}
          onPress={() => navigation.navigate('FeedCalculator')}
          activeOpacity={0.7}
        >
          <View style={[styles.sectionCardIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Icon name="calculator" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.sectionCardContent}>
            <Text style={[styles.sectionCardTitle, { color: theme.colors.text }]}>
              {t('feedGuide.calculator')}
            </Text>
            <Text style={[styles.sectionCardDesc, { color: theme.colors.textSecondary }]}>
              {t('feedGuide.calculatorDesc')}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        {/* Alternative Foods — cat-only catalog for now, hidden for dogs */}
        {showAlternatives && (
          <TouchableOpacity
            style={[
              styles.sectionCard,
              { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
            ]}
            onPress={() => navigation.navigate('FeedGuideAlternatives')}
            activeOpacity={0.7}
          >
            <View
              style={[styles.sectionCardIcon, { backgroundColor: theme.colors.warning + '15' }]}
            >
              <Icon name="search" size={24} color={theme.colors.warning} />
            </View>
            <View style={styles.sectionCardContent}>
              <Text style={[styles.sectionCardTitle, { color: theme.colors.text }]}>
                {t('feedGuide.alternatives')}
              </Text>
              <Text style={[styles.sectionCardDesc, { color: theme.colors.textSecondary }]}>
                {t('feedGuide.alternativesDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Natural Food — cat-only for now */}
        {showNaturalFood && (
          <TouchableOpacity
            style={[
              styles.sectionCard,
              { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
            ]}
            onPress={() => navigation.navigate('FeedGuideNatural')}
            activeOpacity={0.7}
          >
            <View
              style={[styles.sectionCardIcon, { backgroundColor: theme.colors.success + '15' }]}
            >
              <Icon name="beef" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.sectionCardContent}>
              <Text style={[styles.sectionCardTitle, { color: theme.colors.text }]}>
                {t('feedGuide.naturalFood')}
              </Text>
              <Text style={[styles.sectionCardDesc, { color: theme.colors.textSecondary }]}>
                {t('feedGuide.naturalFoodDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Feeding Tips */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>
          {t('feedGuide.feedingTips')}
        </Text>
        <View
          style={[styles.tipsCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
        >
          {tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={[styles.tipBullet, { color: theme.colors.primary }]}>•</Text>
              <Text style={[styles.tipText, { color: theme.colors.text }]}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
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
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: { padding: 4, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  content: { padding: 16, gap: 12 },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  sectionDesc: { fontSize: 13, marginBottom: 8 },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    width: '48%' as unknown as number,
  },
  regionEmoji: { fontSize: 20 },
  regionLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  yourBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  yourBadgeText: { fontSize: 11, fontWeight: '700' },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
  },
  sectionCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardContent: { flex: 1 },
  sectionCardTitle: { fontSize: 16, fontWeight: '700' },
  sectionCardDesc: { fontSize: 13, marginTop: 2 },
  tipsCard: { padding: 16, borderRadius: 14, gap: 10 },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipBullet: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  tipText: { flex: 1, fontSize: 14, lineHeight: 22 },
});
