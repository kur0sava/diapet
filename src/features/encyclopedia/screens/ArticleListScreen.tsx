import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { articles } from '../data/articles';
import { Article, ArticleCategory, BilingualText } from '../types';
import { Ionicons } from '@expo/vector-icons';

const useLang = () => {
  const { i18n } = useTranslation();
  return (text: BilingualText) => text[i18n.language as 'ru' | 'en'] ?? text.en;
};

const CATEGORY_ICONS: Record<ArticleCategory, { name: string; color: string }> = {
  basics: { name: 'book-outline', color: '#4F8EF7' },
  treatment: { name: 'medical-outline', color: '#7C5CBF' },
  monitoring: { name: 'pulse-outline', color: '#32ADE6' },
  nutrition: { name: 'nutrition-outline', color: '#34C759' },
  complications: { name: 'alert-circle-outline', color: '#FF9500' },
  remission: { name: 'sparkles-outline', color: '#5AC8FA' },
  tips: { name: 'bulb-outline', color: '#FFB340' },
};

export default function ArticleListScreen() {
  const navigation = useEncyclopediaNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const lang = useLang();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | null>(null);

  const categoryLabels: Record<ArticleCategory, string> = {
    basics: t('encyclopedia.categories.basics'),
    treatment: t('encyclopedia.categories.treatment'),
    monitoring: t('encyclopedia.categories.monitoring'),
    nutrition: t('encyclopedia.categories.nutrition'),
    complications: t('encyclopedia.categories.complications'),
    remission: t('encyclopedia.categories.remission'),
    tips: t('encyclopedia.categories.tips'),
  };

  const filtered = articles.filter(a => {
    const matchSearch = search === '' ||
      lang(a.titleKey).toLowerCase().includes(search.toLowerCase()) ||
      lang(a.summaryKey).toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || a.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(articles.map(a => a.category))] as ArticleCategory[];

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={[styles.articleCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
      onPress={() => navigation.navigate('ArticleDetail', { articleId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.articleHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_ICONS[item.category].color + '15' }]}>
          <Ionicons name={CATEGORY_ICONS[item.category].name as string} size={14} color={CATEGORY_ICONS[item.category].color} />
          <Text style={[styles.categoryLabel, { color: CATEGORY_ICONS[item.category].color }]}>
            {categoryLabels[item.category]}
          </Text>
        </View>
        <Text style={[styles.readTime, { color: theme.colors.textTertiary }]}>
          {item.readingTimeMinutes} {t('encyclopedia.minutesRead')}
        </Text>
      </View>
      <Text style={[styles.articleTitle, { color: theme.colors.text }]}>{lang(item.titleKey)}</Text>
      <Text style={[styles.articleSummary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {lang(item.summaryKey)}
      </Text>
      <View style={styles.tags}>
        {item.tags.slice(0, 3).map(tag => (
          <View key={lang(tag)} style={[styles.tag, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>#{lang(tag)}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('encyclopedia.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('encyclopedia.subtitle')}</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceSecondary, margin: 16 }]}>
        <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('encyclopedia.searchPlaceholder')}
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        style={{ flexShrink: 0, minHeight: 44 }}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === item ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedCategory === item ? theme.colors.primary : theme.colors.border,
                borderWidth: 1,
              },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === item ? null : item)}
          >
            <Ionicons name={CATEGORY_ICONS[item].name as string} size={16} color={selectedCategory === item ? '#fff' : CATEGORY_ICONS[item].color} />
            <Text style={{ color: selectedCategory === item ? '#fff' : theme.colors.text, fontSize: 13, fontWeight: '500' }}>
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
              <Ionicons name="restaurant" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.feedGuideBannerContent}>
              <Text style={styles.feedGuideBannerTitle}>{t('feedGuide.title')}</Text>
              <Text style={styles.feedGuideBannerDesc}>{t('feedGuide.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  categories: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  list: { padding: 16, gap: 14, paddingBottom: 100 },
  articleCard: { padding: 16, borderRadius: 16, gap: 10 },
  articleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryIcon: { fontSize: 14 },
  categoryLabel: { fontSize: 12, fontWeight: '600' },
  readTime: { fontSize: 12 },
  articleTitle: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  articleSummary: { fontSize: 14, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 12 },
  feedGuideBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, marginBottom: 14 },
  feedGuideBannerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  feedGuideBannerContent: { flex: 1 },
  feedGuideBannerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  feedGuideBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
