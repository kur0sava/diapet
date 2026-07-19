import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useEncyclopediaNavigation } from '@navigation/hooks';
import type { EncyclopediaStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import { ScreenHeader } from '@shared/components/ui';
import { articles } from '../data/articles';
import { BilingualText } from '../types';
import { storageUtils, StorageKeys } from '@storage/mmkv/storage';
import { usePetStore } from '@shared/stores/petStore';
import { logEvent } from '@shared/analytics/analytics';
import { parseTableRow, isTableSeparator } from '../utils/articleMarkdown';

const useLang = () => {
  const { i18n } = useTranslation();
  return (text: BilingualText) => text[i18n.language as 'ru' | 'en'] ?? text.en;
};

interface HeadingEntry {
  level: 2 | 3 | 4;
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
  const species = usePetStore(s => s.activePet?.species ?? 'cat');

  const article = articles.find(a => a.id === route.params.articleId);

  useEffect(() => {
    if (article) {
      logEvent('encyclopedia_article_opened', {
        article_id: article.id,
        category: article.category,
      });
    }
  }, [article]);

  // Bookmark state
  const getBookmarks = (): string[] =>
    storageUtils.getObject<string[]>(StorageKeys.BOOKMARKED_ARTICLES) ?? [];

  const [isBookmarked, setIsBookmarked] = useState(() =>
    article ? getBookmarks().includes(article.id) : false
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
    lang(article.contentKey)
      .split('\n')
      .forEach((raw, i) => {
        const line = raw.trimStart();
        if (line.startsWith('#### ')) {
          result.push({ level: 4, text: line.slice(5), lineIndex: i });
        } else if (line.startsWith('### ')) {
          result.push({ level: 3, text: line.slice(4), lineIndex: i });
        } else if (line.startsWith('## ')) {
          result.push({ level: 2, text: line.slice(3), lineIndex: i });
        }
      });
    return result;
  }, [article, lang]);

  const showToc = headings.length >= 3;

  const handleHeadingLayout = useCallback((lineIndex: number, event: LayoutChangeEvent) => {
    headingYPositions.current[lineIndex] = event.nativeEvent.layout.y;
  }, []);

  const scrollToHeading = useCallback((lineIndex: number) => {
    // Collapse TOC first, then scroll after layout settles so articleContentY is accurate
    setTocExpanded(false);
    requestAnimationFrame(() => {
      const y = headingYPositions.current[lineIndex];
      if (y !== undefined && scrollRef.current) {
        scrollRef.current.scrollTo({ y: y + articleContentY.current, animated: true });
      }
    });
  }, []);

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, padding: 20 }}>
          {t('encyclopedia.articleNotFound')}
        </Text>
      </SafeAreaView>
    );
  }

  // Render inline text with **bold** segments
  const renderInline = (text: string, baseStyle: object, key: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    if (parts.length === 1)
      return (
        <Text key={key} style={[baseStyle, { color: theme.colors.text }]}>
          {text}
        </Text>
      );
    return (
      <Text key={key} style={[baseStyle, { color: theme.colors.text }]}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={j} style={{ fontWeight: '700' }}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  // Одна строка внутри бокса-цитаты (поддерживает вложенный "- " буллет и **bold**).
  const renderQuoteLine = (raw: string, key: string) => {
    const trimmed = raw.trimStart();
    if (trimmed === '') return <View key={key} style={{ height: 6 }} />;
    if (trimmed.startsWith('- ')) {
      return (
        <View key={key} style={styles.quoteBulletItem}>
          <Text style={[styles.blockquoteText, { color: theme.colors.text }]}>{'•  '}</Text>
          {renderInline(trimmed.slice(2), [styles.blockquoteText, { flex: 1 }], `${key}-t`)}
        </View>
      );
    }
    return renderInline(trimmed, styles.blockquoteText, key);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    // Bundled articles open with "# <title>" that duplicates the header title
    // shown above. Drop that leading H1 so the title isn't shown twice — and so
    // it isn't rendered as a raw "# ..." paragraph.
    const firstIdx = lines.findIndex(l => l.trim() !== '');
    if (firstIdx !== -1 && lines[firstIdx].startsWith('# ') && !lines[firstIdx].startsWith('## ')) {
      lines[firstIdx] = '';
    }

    const out: React.ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trimStart();
      const indent = raw.length - line.length;

      // ── Таблица: строка с "|", за которой следует разделитель "|---|" ──
      if (line.startsWith('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
        const header = parseTableRow(line);
        const rows: string[][] = [];
        let j = i + 2;
        while (j < lines.length && lines[j].trimStart().startsWith('|')) {
          rows.push(parseTableRow(lines[j]));
          j++;
        }
        const colCount = header.length;
        out.push(
          <View key={`tbl-${i}`} style={[styles.table, { borderColor: theme.colors.border }]}>
            <View
              style={[
                styles.tableRow,
                styles.tableHeaderRow,
                { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border },
              ]}
            >
              {header.map((cell, c) => (
                <View
                  key={c}
                  style={[
                    styles.tableCell,
                    c < colCount - 1 && styles.tableCellDivider,
                    { borderColor: theme.colors.border },
                  ]}
                >
                  {renderInline(cell, styles.tableHeaderText, `tbl-${i}-h${c}`)}
                </View>
              ))}
            </View>
            {rows.map((row, r) => (
              <View
                key={r}
                style={[
                  styles.tableRow,
                  r < rows.length - 1 && styles.tableRowDivider,
                  { borderColor: theme.colors.border },
                ]}
              >
                {Array.from({ length: colCount }).map((_, c) => (
                  <View
                    key={c}
                    style={[
                      styles.tableCell,
                      c < colCount - 1 && styles.tableCellDivider,
                      { borderColor: theme.colors.border },
                    ]}
                  >
                    {renderInline(row[c] ?? '', styles.tableCellText, `tbl-${i}-r${r}c${c}`)}
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
        i = j;
        continue;
      }

      // ── Блок-цитата: подряд идущие ">" строки → один бокс ──
      if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        let j = i;
        while (j < lines.length && lines[j].trimStart().startsWith('>')) {
          quoteLines.push(lines[j].trimStart().replace(/^>\s?/, ''));
          j++;
        }
        out.push(
          <View
            key={`bq-${i}`}
            style={[
              styles.blockquote,
              { borderLeftColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
            ]}
          >
            {quoteLines.map((ql, k) => renderQuoteLine(ql, `bq-${i}-${k}`))}
          </View>
        );
        i = j;
        continue;
      }

      // ── Заголовки h1–h4 (с учётом отступа) ──
      if (line.startsWith('#### ')) {
        out.push(
          <Text
            key={`line-${i}`}
            style={[styles.h4, { color: theme.colors.text }]}
            onLayout={e => handleHeadingLayout(i, e)}
          >
            {line.slice(5)}
          </Text>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        out.push(
          <Text
            key={`line-${i}`}
            style={[styles.h3, { color: theme.colors.text }]}
            onLayout={e => handleHeadingLayout(i, e)}
          >
            {line.slice(4)}
          </Text>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        out.push(
          <Text
            key={`line-${i}`}
            style={[styles.h2, { color: theme.colors.text }]}
            onLayout={e => handleHeadingLayout(i, e)}
          >
            {line.slice(3)}
          </Text>
        );
        i++;
        continue;
      }
      // h1 (single hash) — defensive for remote/manifest content.
      if (line.startsWith('# ')) {
        out.push(
          <Text
            key={`line-${i}`}
            style={[styles.h1, { color: theme.colors.text }]}
            onLayout={e => handleHeadingLayout(i, e)}
          >
            {line.slice(2)}
          </Text>
        );
        i++;
        continue;
      }
      if (line.startsWith('---')) {
        out.push(
          <View
            key={`line-${i}`}
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
        );
        i++;
        continue;
      }
      if (line === '') {
        out.push(<View key={`line-${i}`} style={{ height: 8 }} />);
        i++;
        continue;
      }
      // Вложенность списка по величине отступа (2 пробела ≈ 1 уровень).
      const depth = Math.min(Math.floor(indent / 2), 3);
      // Нумерованный список: "1. text"
      const numMatch = line.match(/^(\d+)\.\s+(.+)/);
      if (numMatch) {
        out.push(
          <View
            key={`line-${i}`}
            style={[styles.bulletItem, depth > 0 && { marginLeft: depth * 16 }]}
          >
            <Text style={[styles.bulletDot, { color: theme.colors.textSecondary }]}>
              {numMatch[1]}.
            </Text>
            {renderInline(numMatch[2], styles.body, `ni-${i}`)}
          </View>
        );
        i++;
        continue;
      }
      // Маркированный список: "- text" (вложенный → ◦)
      if (line.startsWith('- ')) {
        out.push(
          <View
            key={`line-${i}`}
            style={[styles.bulletItem, depth > 0 && { marginLeft: depth * 16 }]}
          >
            <Text style={[styles.bulletDot, { color: theme.colors.textSecondary }]}>
              {depth > 0 ? '◦' : '•'}
            </Text>
            {renderInline(line.slice(2), styles.body, `bi-${i}`)}
          </View>
        );
        i++;
        continue;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        out.push(
          <Text key={`line-${i}`} style={[styles.bold, { color: theme.colors.text }]}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
        i++;
        continue;
      }
      out.push(renderInline(line, styles.body, `line-${i}`));
      i++;
    }
    return out;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title={t('encyclopedia.title')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.bookmarkButton}
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked
                ? t('encyclopedia.removeBookmark', { defaultValue: 'Remove bookmark' })
                : t('encyclopedia.addBookmark', { defaultValue: 'Add bookmark' })
            }
            accessibilityState={{ selected: isBookmarked }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name={isBookmarked ? 'star' : 'star-outline'}
              size={24}
              color={isBookmarked ? '#F5A623' : theme.colors.textTertiary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.articleTitle, { color: theme.colors.text }]}>
          {lang(article.titleKey)}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            ⏱ {article.readingTimeMinutes} {t('encyclopedia.minutesRead')}
          </Text>
        </View>
        <Text
          style={[
            styles.summary,
            { color: theme.colors.textSecondary, backgroundColor: theme.colors.primaryLight },
          ]}
        >
          {lang(article.summaryKey)}
        </Text>

        <View
          style={[
            styles.disclaimerBanner,
            {
              backgroundColor: `${theme.colors.warning}15`,
              borderColor: `${theme.colors.warning}40`,
            },
          ]}
        >
          <Icon
            name="information-circle-outline"
            size={16}
            color={theme.colors.warning}
            style={{ marginTop: 2 }}
          />
          <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
            {t('encyclopedia.disclaimer')}
          </Text>
        </View>

        {showToc && (
          <View
            style={[
              styles.tocContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
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
                      heading.level === 4 && styles.tocItemIndented2,
                    ]}
                    onPress={() => scrollToHeading(heading.lineIndex)}
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[
                        styles.tocItemText,
                        { color: theme.colors.primary },
                        heading.level >= 3 && styles.tocItemTextSub,
                      ]}
                    >
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
          onLayout={e => {
            articleContentY.current = e.nativeEvent.layout.y;
          }}
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
                <Text style={[styles.referenceNumber, { color: theme.colors.textTertiary }]}>
                  {i + 1}.
                </Text>
                <Text style={[styles.referenceText, { color: theme.colors.textSecondary }]}>
                  {lang(ref)}
                </Text>
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
              // Skip cross-species articles
              if (related.species && related.species !== 'all' && related.species !== species)
                return null;
              return (
                <TouchableOpacity
                  key={relId}
                  style={[
                    styles.relatedCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  ]}
                  onPress={() => navigation.push('ArticleDetail', { articleId: relId })}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.relatedCardTitle, { color: theme.colors.text }]}
                      numberOfLines={1}
                    >
                      {lang(related.titleKey)}
                    </Text>
                    <Text
                      style={[styles.relatedCardSummary, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
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
  bookmarkButton: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 60 },
  articleTitle: { fontSize: 24, fontWeight: '800', lineHeight: 32, marginBottom: 12 },
  meta: { flexDirection: 'row', marginBottom: 16 },
  metaText: { fontSize: 13 },
  summary: { fontSize: 15, lineHeight: 22, padding: 16, borderRadius: 12, marginBottom: 12 },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  disclaimerText: { fontSize: 12, lineHeight: 18, flex: 1 },
  articleContent: { gap: 4 },
  h1: { fontSize: 23, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  h2: { fontSize: 20, fontWeight: '800', marginTop: 20, marginBottom: 8 },
  h3: { fontSize: 17, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  h4: { fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 4 },
  bold: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  body: { fontSize: 15, lineHeight: 24 },
  blockquote: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 10,
    paddingRight: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  blockquoteText: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  quoteBulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 1 },
  divider: { height: 1, marginVertical: 16 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginVertical: 2 },
  bulletDot: { fontSize: 15, lineHeight: 24, width: 12 },
  // Таблицы
  table: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  tableRow: { flexDirection: 'row' },
  tableHeaderRow: {},
  tableRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth },
  tableCell: { flex: 1, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  tableCellDivider: { borderRightWidth: StyleSheet.hairlineWidth },
  tableHeaderText: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  tableCellText: { fontSize: 13, lineHeight: 18 },
  // TOC styles
  tocContainer: { borderWidth: 1, borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  tocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  tocHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tocTitle: { fontSize: 15, fontWeight: '600' },
  tocList: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  tocItem: { paddingVertical: 6, paddingLeft: 4 },
  tocItemIndented: { paddingLeft: 20 },
  tocItemIndented2: { paddingLeft: 36 },
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
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  relatedCardTitle: { fontSize: 14, fontWeight: '600' },
  relatedCardSummary: { fontSize: 12, lineHeight: 17, marginTop: 2 },
});
