import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, LayoutChangeEvent,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import type { EncyclopediaStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { articles } from '../data/articles';
import { storageUtils, StorageKeys } from '@storage/mmkv/storage';

interface HeadingEntry {
  level: 2 | 3;
  text: string;
  lineIndex: number;
}

export default function ArticleDetailScreen() {
  const navigation = useEncyclopediaNavigation();
  const route = useRoute<RouteProp<EncyclopediaStackParamList, 'ArticleDetail'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const article = articles.find(a => a.id === route.params.articleId);

  // Bookmark state
  const getBookmarks = (): string[] =>
    storageUtils.getObject<string[]>(StorageKeys.BOOKMARKED_ARTICLES) ?? [];

  const [isBookmarked, setIsBookmarked] = useState(() =>
    article ? getBookmarks().includes(article.id) : false,
  );

  const toggleBookmark = useCallback(() => {
    if (!article) return;
    const current = getBookmarks();
    let updated: string[];
    if (current.includes(article.id)) {
      updated = current.filter(id => id !== article.id);
    } else {
      updated = [...current, article.id];
    }
    storageUtils.setObject(StorageKeys.BOOKMARKED_ARTICLES, updated);
    setIsBookmarked(!isBookmarked);
  }, [article, isBookmarked]);

  // TOC state
  const [tocExpanded, setTocExpanded] = useState(false);
  const headingYPositions = useRef<Record<number, number>>({});

  // Parse headings from content
  const headings: HeadingEntry[] = useMemo(() => {
    if (!article) return [];
    const result: HeadingEntry[] = [];
    article.contentKey.split('\n').forEach((line, i) => {
      if (line.startsWith('### ')) {
        result.push({ level: 3, text: line.replace('### ', ''), lineIndex: i });
      } else if (line.startsWith('## ')) {
        result.push({ level: 2, text: line.replace('## ', ''), lineIndex: i });
      }
    });
    return result;
  }, [article]);

  const showToc = headings.length >= 3;

  const handleHeadingLayout = useCallback((lineIndex: number, event: LayoutChangeEvent) => {
    headingYPositions.current[lineIndex] = event.nativeEvent.layout.y;
  }, []);

  const scrollToHeading = useCallback((lineIndex: number) => {
    const y = headingYPositions.current[lineIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: y + 140, animated: true });
    }
    setTocExpanded(false);
  }, []);

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, padding: 20 }}>{t('encyclopedia.articleNotFound')}</Text>
      </SafeAreaView>
    );
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <Text
            key={`line-${i}`}
            style={[styles.h2, { color: theme.colors.text }]}
            onLayout={(e) => handleHeadingLayout(i, e)}
          >
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Text
            key={`line-${i}`}
            style={[styles.h3, { color: theme.colors.text }]}
            onLayout={(e) => handleHeadingLayout(i, e)}
          >
            {line.replace('### ', '')}
          </Text>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <View key={`line-${i}`} style={[styles.blockquote, { borderLeftColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.blockquoteText, { color: theme.colors.text }]}>{line.replace('> ', '')}</Text>
          </View>
        );
      }
      if (line.startsWith('---')) {
        return <View key={`line-${i}`} style={[styles.divider, { backgroundColor: theme.colors.border }]} />;
      }
      if (line.trim() === '') {
        return <View key={`line-${i}`} style={{ height: 8 }} />;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={`line-${i}`} style={[styles.bold, { color: theme.colors.text }]}>{line.replace(/\*\*/g, '')}</Text>;
      }
      return <Text key={`line-${i}`} style={[styles.body, { color: theme.colors.text }]}>{line}</Text>;
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {t('encyclopedia.title')}
        </Text>
        <TouchableOpacity onPress={toggleBookmark} style={styles.bookmarkButton}>
          <Ionicons
            name={isBookmarked ? 'star' : 'star-outline'}
            size={24}
            color={isBookmarked ? '#F5A623' : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.articleTitle, { color: theme.colors.text }]}>{article.titleKey}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            ⏱ {article.readingTimeMinutes} {t('encyclopedia.minutesRead')}
          </Text>
        </View>
        <Text style={[styles.summary, { color: theme.colors.textSecondary, backgroundColor: theme.colors.primaryLight }]}>
          {article.summaryKey}
        </Text>

        {showToc && (
          <View style={[styles.tocContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.tocHeader}
              onPress={() => setTocExpanded(!tocExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.tocHeaderLeft}>
                <Ionicons name="list-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.tocTitle, { color: theme.colors.text }]}>
                  {t('encyclopedia.tableOfContents')}
                </Text>
              </View>
              <Ionicons
                name={tocExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {tocExpanded && (
              <View style={styles.tocList}>
                {headings.map((heading, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.tocItem,
                      heading.level === 3 && styles.tocItemIndented,
                    ]}
                    onPress={() => scrollToHeading(heading.lineIndex)}
                    activeOpacity={0.6}
                  >
                    <Text style={[
                      styles.tocItemText,
                      { color: theme.colors.primary },
                      heading.level === 3 && styles.tocItemTextSub,
                    ]}>
                      {heading.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.articleContent}>
          {renderContent(article.contentKey)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  bookmarkButton: { width: 60, alignItems: 'flex-end' },
  content: { padding: 20, paddingBottom: 60 },
  articleTitle: { fontSize: 24, fontWeight: '800', lineHeight: 32, marginBottom: 12 },
  meta: { flexDirection: 'row', marginBottom: 16 },
  metaText: { fontSize: 13 },
  summary: { fontSize: 15, lineHeight: 22, padding: 16, borderRadius: 12, marginBottom: 24 },
  articleContent: { gap: 4 },
  h2: { fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  h3: { fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  bold: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  body: { fontSize: 15, lineHeight: 24 },
  blockquote: { borderLeftWidth: 4, paddingLeft: 12, paddingVertical: 10, paddingRight: 12, borderRadius: 4, marginVertical: 8 },
  blockquoteText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  divider: { height: 1, marginVertical: 16 },
  // TOC styles
  tocContainer: { borderWidth: 1, borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  tocHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  tocHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tocTitle: { fontSize: 15, fontWeight: '600' },
  tocList: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  tocItem: { paddingVertical: 6, paddingLeft: 4 },
  tocItemIndented: { paddingLeft: 20 },
  tocItemText: { fontSize: 14, fontWeight: '500' },
  tocItemTextSub: { fontSize: 13, fontWeight: '400' },
});
