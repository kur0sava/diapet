import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { articles } from '../data/articles';
import { Article, ArticleCategory, BilingualText } from '../types';
import { Icon } from '@shared/components/ui/Icon';
import type { IoniconName } from '@shared/components/ui';
import { storageUtils, StorageKeys } from '@storage/mmkv/storage';
import { usePetStore } from '@shared/stores/petStore';
import { getFoodCatalog } from '../data/foodCatalog';

const useLang = () => {
  const { i18n } = useTranslation();
  return (text: BilingualText) => text[i18n.language as 'ru' | 'en'] ?? text.en;
};

const CATEGORY_ICONS: Record<ArticleCategory, { name: IoniconName; color: string }> = {
  basics: { name: 'book-outline', color: '#4F8EF7' },
  treatment: { name: 'medical-outline', color: '#7C5CBF' },
  monitoring: { name: 'pulse-outline', color: '#32ADE6' },
  nutrition: { name: 'nutrition-outline', color: '#34C759' },
  complications: { name: 'alert-circle-outline', color: '#FF9500' },
  remission: { name: 'sparkles-outline', color: '#5AC8FA' },
  tips: { name: 'bulb-outline', color: '#FFB340' },
  lifestyle: { name: 'heart-outline', color: '#FF6B6B' },
  medical: { name: 'medkit-outline', color: '#E74C3C' },
};

export default function ArticleListScreen() {
  const navigation = useEncyclopediaNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const lang = useLang();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const species = usePetStore(s => s.activePet?.species ?? 'cat');
  // "Updated <date>" on the feed-guide banner signals the food catalog is
  // maintained (remote-refreshed), not frozen in the APK.
  const catalogDate = (() => {
    const d = new Date(getFoodCatalog().generatedAt);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  })();
  const bookmarkedIds = showBookmarks
    ? (storageUtils.getObject<string[]>(StorageKeys.BOOKMARKED_ARTICLES) ?? [])
    : [];

  const categoryLabels: Record<ArticleCategory, string> = {
    basics: t('encyclopedia.categories.basics'),
    treatment: t('encyclopedia.categories.treatment'),
    monitoring: t('encyclopedia.categories.monitoring'),
    nutrition: t('encyclopedia.categories.nutrition'),
    complications: t('encyclopedia.categories.complications'),
    remission: t('encyclopedia.categories.remission'),
    tips: t('encyclopedia.categories.tips'),
    lifestyle: t('encyclopedia.categories.lifestyle'),
    medical: t('encyclopedia.categories.medical'),
  };

  const speciesArticles = articles.filter(
    a => !a.species || a.species === 'all' || a.species === species
  );

  /**
   * Search index, rebuilt only when the language changes.
   *
   * Searching title+summary alone left most of the corpus unreachable: the card
   * shows tags like "#мёд" / "#ленте" that the search itself could not match
   * (154 of 270 tags did not find their own article), so real owner queries
   * ("мёд", "рвота", "вес") returned nothing even though the content covers them.
   *
   * `meta` (title + summary + tags) is the precise pass. `body` (full article
   * text) is only consulted when the precise pass finds nothing — that keeps
   * normal results clean while making sure a word that IS in the encyclopedia
   * never yields an empty screen.
   */
  const searchIndex = useMemo(() => {
    const pick = (x: BilingualText) => x[i18n.language as 'ru' | 'en'] ?? x.en;
    const idx = new Map<string, { meta: string; body: string }>();
    for (const a of articles) {
      idx.set(a.id, {
        meta: `${pick(a.titleKey)} ${pick(a.summaryKey)} ${a.tags.map(pick).join(' ')}`.toLowerCase(),
        body: pick(a.contentKey).toLowerCase(),
      });
    }
    return idx;
  }, [i18n.language]);

  const query = search.trim().toLowerCase();
  const scoped = speciesArticles.filter(a => {
    const matchCategory = !selectedCategory || a.category === selectedCategory;
    const matchBookmark = !showBookmarks || bookmarkedIds.includes(a.id);
    return matchCategory && matchBookmark;
  });
  const metaHits =
    query === '' ? scoped : scoped.filter(a => searchIndex.get(a.id)?.meta.includes(query));
  const filtered =
    query !== '' && metaHits.length === 0
      ? scoped.filter(a => searchIndex.get(a.id)?.body.includes(query))
      : metaHits;

  const categories = [...new Set(speciesArticles.map(a => a.category))] as ArticleCategory[];

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.articleHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: CATEGORY_ICONS[item.category].color + '15' },
          ]}
        >
          <Icon
            name={CATEGORY_ICONS[item.category].name}
            size={14}
            color={CATEGORY_ICONS[item.category].color}
          />
          <Text style={[styles.categoryLabel, { color: CATEGORY_ICONS[item.category].color }]}>
            {categoryLabels[item.category]}
          </Text>
        </View>
        <Text style={[styles.readTime, { color: theme.colors.textTertiary }]}>
          {item.readingTimeMinutes} {t('encyclopedia.minutesRead')}
        </Text>
      </View>
      <Text style={[styles.articleTitle, { color: theme.colors.text }]}>{lang(item.titleKey)}</Text>
      <Text
        style={[styles.articleSummary, { color: theme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {lang(item.summaryKey)}
      </Text>
      <View style={styles.tags}>
        {item.tags.slice(0, 3).map((tag, ti) => (
          <View
            key={`tag-${ti}`}
            style={[styles.tag, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
              #{lang(tag)}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('encyclopedia.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('encyclopedia.subtitle')}
        </Text>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surfaceSecondary, margin: 16 },
        ]}
      >
        <Icon name="search" size={18} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('encyclopedia.searchPlaceholder')}
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, minHeight: 44 }}
        contentContainerStyle={styles.categories}
        ListHeaderComponent={
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: showBookmarks ? '#F5A623' : theme.colors.surface,
                borderColor: showBookmarks ? '#F5A623' : theme.colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setShowBookmarks(!showBookmarks)}
            accessibilityLabel={t('encyclopedia.bookmarks')}
            accessibilityRole="button"
          >
            <Icon
              name={showBookmarks ? 'star' : 'star-outline'}
              size={16}
              color={showBookmarks ? '#fff' : '#F5A623'}
            />
            <Text
              style={{
                color: showBookmarks ? '#fff' : theme.colors.text,
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              {t('encyclopedia.bookmarks')}
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === item ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedCategory === item ? theme.colors.primary : theme.colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
            accessibilityLabel={categoryLabels[item]}
            accessibilityRole="button"
          >
            <Icon
              name={CATEGORY_ICONS[item].name}
              size={16}
              color={selectedCategory === item ? '#fff' : CATEGORY_ICONS[item].color}
            />
            <Text
              style={{
                color: selectedCategory === item ? '#fff' : theme.colors.text,
                fontSize: 13,
                fontWeight: '500',
              }}
            >
              {categoryLabels[item]}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.feedGuideBanner, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('FeedGuide')}
            activeOpacity={0.8}
          >
            <View style={styles.feedGuideBannerIcon}>
              <Icon name="restaurant" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.feedGuideBannerContent}>
              <Text style={styles.feedGuideBannerTitle}>{t('feedGuide.title')}</Text>
              <Text style={styles.feedGuideBannerDesc}>{t('feedGuide.subtitle')}</Text>
              {catalogDate !== '' && (
                <View style={styles.feedGuideUpdatedRow}>
                  <Icon name="sync-outline" size={11} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.feedGuideUpdated}>
                    {t('feedGuide.catalogUpdatedShort', { date: catalogDate })}
                  </Text>
                </View>
              )}
            </View>
            <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        }
        ListEmptyComponent={
          // Every other list in the app explains itself when empty; this one
          // used to leave a blank area under the banner with no hint that the
          // search/bookmark filter was the reason.
          <View style={styles.empty}>
            <Icon
              name={showBookmarks && query === '' ? 'star-outline' : 'search-outline'}
              size={32}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {showBookmarks && query === ''
                ? t('encyclopedia.noBookmarks')
                : t('encyclopedia.noResults')}
            </Text>
            <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
              {showBookmarks && query === ''
                ? t('encyclopedia.noBookmarksHint')
                : t('encyclopedia.noResultsHint')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categories: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, alignItems: 'center' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  list: { padding: 16, gap: 14, paddingBottom: 100 },
  articleCard: { padding: 16, borderRadius: 16, gap: 10 },
  articleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 1,
  },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 12, fontWeight: '600' },
  readTime: { fontSize: 12, flexShrink: 0 },
  articleTitle: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  articleSummary: { fontSize: 14, lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyHint: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 12 },
  feedGuideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  feedGuideBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedGuideBannerContent: { flex: 1 },
  feedGuideBannerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  feedGuideBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  feedGuideUpdatedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  feedGuideUpdated: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
