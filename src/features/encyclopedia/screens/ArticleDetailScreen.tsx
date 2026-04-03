import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import type { EncyclopediaStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import { articles } from '../data/articles';
import { BilingualText } from '../types';
import { storageUtils, StorageKeys } from '@storage/mmkv/storage';

const useLang = () => {
  const { i18n } = useTranslation();
  return (text: BilingualText) => text[i18n.language as 'ru' | 'en'] ?? text.en;
};

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
  const lang = useLang();
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
    setIsBookmarked(prev => !prev);
  }, [article]);

  // TOC state
  const [tocExpanded, setTocExpanded] = useState(false);
  const headingYPositions = useRef<Record<number, number>>({});
  const articleContentY = useRef(0);

  // Parse headings from content
  const headings: HeadingEntry[] = useMemo(() => {
    if (!article) return [];
    const result: HeadingEntry[] = [];
    lang(article.contentKey).split('\n').forEach((line, i) => {
      if (line.startsWith('### ')) {
        result.push({ level: 3, text: line.replace('### ', ''), lineIndex: i });
      } else if (line.startsWith('## ')) {
        result.push({ level: 2, text: line.replace('## ', ''), lineIndex: i });
      }
    });
    return result;
  }, [article, lang]);

  const showToc = headings.length >= 3;

  const handleHeadingLayout = useCallback((lineIndex: number, event: LayoutChangeEvent) => {
    headingYPositions.current[lineIndex] = event.nativeEvent.layout.y;
  }, []);

  const scrollToHeading = useCallback((lineIndex: number) => {
    const y = headingYPositions.current[lineIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: y + articleContentY.current, animated: true });
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

  // Render inline text with **bold** segments
  const renderInline = (text: string, baseStyle: object, key: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length === 1) return <Text key={key} style={[baseStyle, { color: theme.colors.text }]}>{text}</Text>;
    return (
      <Text key={key} style={[baseStyle, { color: theme.colors.text }]}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={j} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  };

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
            {renderInline(line.replace('> ', ''), styles.blockquoteText, `bq-${i}`)}
          </View>
        );
      }
      if (line.startsWith('---')) {
        return <View key={`line-${i}`} style={[styles.divider, { backgroundColor: theme.colors.border }]} />;
      }
      if (line.trim() === '') {
        return <View key={`line-${i}`} style={{ height: 8 }} />;
      }
      // Numbered list: 1. text, 2. text, etc.
      const numMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        return (
          <View key={`line-${i}`} style={styles.bulletItem}>
            <Text style={[styles.bulletDot, { color: theme.colors.textSecondary }]}>{numMatch[1]}.</Text>
            {renderInline(numMatch[2], styles.body, `ni-${i}`)}
          </View>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <View key={`line-${i}`} style={styles.bulletItem}>
            <Text style={[styles.bulletDot, { color: theme.colors.textSecondary }]}>{'•'}</Text>
            {renderInline(line.slice(2), styles.body, `bi-${i}`)}
          </View>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={`line-${i}`} style={[styles.bold, { color: theme.colors.text }]}>{line.replace(/\*\*/g, '')}</Text>;
      }
      return renderInline(line, styles.body, `line-${i}`);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {t('encyclopedia.title')}
        </Text>
        <TouchableOpacity onPress={toggleBookmark} style={styles.bookmarkButton}>
          <Icon
            name={isBookmarked ? 'star' : 'star-outline'}
            size={24}
            color={isBookmarked ? '#F5A623' : theme.colors.textTertiary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.articleTitle, { color: theme.colors.text }]}>{lang(article.titleKey)}</Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            ⏱ {article.readingTimeMinutes} {t('encyclopedia.minutesRead')}
          </Text>
        </View>
        <Text style={[styles.summary, { color: theme.colors.textSecondary, backgroundColor: theme.colors.primaryLight }]}>
          {lang(article.summaryKey)}
        </Text>

        <View style={[styles.disclaimerBanner, { backgroundColor: `${theme.colors.warning}15`, borderColor: `${theme.colors.warning}40` }]}>
          <Icon name="information-circle-outline" size={16} color={theme.colors.warning} style={{ marginTop: 2 }} />
          <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
            {t('encyclopedia.disclaimer')}
          </Text>
        </View>

        {showToc && (
          <View style={[styles.tocContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.tocHeader}
              onPress={() => setTocExpanded(!tocExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.tocHeaderLeft}>
                <Icon name="list-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.tocTitle, { color: theme.colors.text }]}>
                  {t('encyclopedia.tableOfContents')}
                </Text>
              </View>
              <Icon
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

        <View
          style={styles.articleContent}
          onLayout={(e) => { articleContentY.current = e.nativeEvent.layout.y; }}
        >
          {renderContent(lang(article.contentKey))}
        </View>

        {/* References */}
        {article.references && article.references.length > 0 && (
          <View style={[styles.referencesSection, { borderTopColor: theme.colors.divider }]}>
            <Text style={[styles.referencesTitle, { color: theme.colors.text }]}>
              {t('encyclopedia.references')}
            </Text>
            {article.references.map((ref, i) => (
              <View key={`ref-${i}`} style={styles.referenceItem}>
                <Text style={[styles.referenceNumber, { color: theme.colors.textTertiary }]}>{i + 1}.</Text>
                <Text style={[styles.referenceText, { color: theme.colors.textSecondary }]}>{lang(ref)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Related Articles */}
        {article.relatedArticleIds && article.relatedArticleIds.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={[styles.relatedTitle, { color: theme.colors.text }]}>
              {t('encyclopedia.relatedArticles')}
            </Text>
            {article.relatedArticleIds.map(relId => {
              const related = articles.find(a => a.id === relId);
              if (!related) return null;
              return (
                <TouchableOpacity
                  key={relId}
                  style={[styles.relatedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={() => navigation.push('ArticleDetail', { articleId: relId })}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.relatedCardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {lang(related.titleKey)}
                    </Text>
                    <Text style={[styles.relatedCardSummary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {lang(related.summaryKey)}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  summary: { fontSize: 15, lineHeight: 22, padding: 16, borderRadius: 12, marginBottom: 12 },
  disclaimerBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20 },
  disclaimerText: { fontSize: 12, lineHeight: 18, flex: 1 },
  articleContent: { gap: 4 },
  h2: { fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  h3: { fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  bold: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  body: { fontSize: 15, lineHeight: 24 },
  blockquote: { borderLeftWidth: 4, paddingLeft: 12, paddingVertical: 10, paddingRight: 12, borderRadius: 4, marginVertical: 8 },
  blockquoteText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  divider: { height: 1, marginVertical: 16 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginVertical: 2 },
  bulletDot: { fontSize: 15, lineHeight: 24, width: 12 },
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
  // References
  referencesSection: { borderTopWidth: 1, marginTop: 24, paddingTop: 16 },
  referencesTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  referenceItem: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  referenceNumber: { fontSize: 13, lineHeight: 20, width: 20 },
  referenceText: { fontSize: 13, lineHeight: 20, flex: 1 },
  // Related Articles
  relatedSection: { marginTop: 24 },
  relatedTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  relatedCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  relatedCardTitle: { fontSize: 14, fontWeight: '600' },
  relatedCardSummary: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
