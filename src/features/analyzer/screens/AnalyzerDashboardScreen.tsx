/**
 * C26: Analyzer Dashboard — full analytics screen with trends, patterns, risk breakdown.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useNavigation } from '@react-navigation/native';
import { useHomeNavigation, useRootNavigation } from '@navigation/hooks';
import { Card } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { RiskScoreWidget } from '../components/RiskScoreWidget';
import { TrendIndicator } from '../components/TrendIndicator';
import { SmartInsightCard } from '../components/SmartInsightCard';
import { getAnalyzerDisclaimer } from '../engine/safetyGuard';
import type { PatternType } from '../engine/patternDetector';

const PATTERN_LABEL_KEYS: Record<PatternType, string> = {
  somogyi: 'analyzer.patternSomogyi',
  dawn_phenomenon: 'analyzer.patternDawn',
  post_meal_spike: 'analyzer.patternPostMeal',
  missed_injection_impact: 'analyzer.patternMissedInjection',
  food_correlation: 'analyzer.patternFoodCorrelation',
  dose_response: 'analyzer.patternDoseResponse',
  remission_candidate: 'analyzer.patternRemission',
};

const FACTOR_LABEL_KEYS: Record<string, string> = {
  glucose_stability: 'analyzer.factorGlucose',
  injection_adherence: 'analyzer.factorInjection',
  feeding_regularity: 'analyzer.factorFeeding',
  symptom_severity: 'analyzer.factorSymptoms',
  weight_trend: 'analyzer.factorWeight',
  time_since_diagnosis: 'analyzer.factorDiagnosis',
};

export default function AnalyzerDashboardScreen() {
  const navigation = useNavigation();
  const homeNavigation = useHomeNavigation();
  const rootNavigation = useRootNavigation();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { trends, patterns, riskScore, smartAlert, hasEnoughData, readingsCount } = useAnalyzer();
  const { isPro, canAccessAdvanced } = useSubscription();

  const handleOpenPrediction = () => {
    if (canAccessAdvanced()) {
      homeNavigation.navigate('AdvancedAnalytics');
    } else {
      rootNavigation.navigate('Paywall');
    }
  };

  const disclaimer = getAnalyzerDisclaimer(i18n.language === 'ru' ? 'ru' : 'en');

  function getFactorColor(score: number): string {
    if (score <= 20) return theme.colors.success;
    if (score <= 40) return theme.colors.primary;
    if (score <= 65) return theme.colors.warning;
    return theme.colors.danger;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>
            {'\u2190 '}
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}
        >
          {t('analyzer.title')}
        </Text>
        <View style={{ width: 60 }} />
      </View>
      <LinearGradient
        colors={[...theme.gradients.primary] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 3 }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Insufficient data */}
        {!hasEnoughData && (
          <Card style={styles.emptyCard}>
            <Icon name="analytics" size={40} color={theme.colors.textTertiary} />
            <Text
              style={[
                styles.emptyTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('analyzer.insufficientData')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {t('analyzer.emptyStateHint')}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: theme.colors.textTertiary, fontSize: 12, marginTop: 6 },
              ]}
            >
              {t('analyzer.readings', { count: readingsCount })}
            </Text>
          </Card>
        )}

        {/* AI Prediction CTA */}
        {hasEnoughData && (
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenPrediction}>
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiCtaCard}
            >
              <View style={styles.aiCtaIconWrap}>
                <Icon name="sparkles" size={22} color="#fff" />
              </View>
              <View style={styles.aiCtaContent}>
                <View style={styles.aiCtaTitleRow}>
                  <Text style={[styles.aiCtaTitle, { fontFamily: theme.fonts.bold }]}>
                    {t('analyzer.aiPredictionCtaTitle')}
                  </Text>
                  {!isPro && (
                    <View style={styles.proBadge}>
                      <Text style={[styles.proBadgeText, { fontFamily: theme.fonts.bold }]}>
                        PRO
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.aiCtaDesc}>{t('analyzer.aiPredictionCtaDesc')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Smart Insight */}
        {smartAlert && <SmartInsightCard alert={smartAlert} />}

        {/* Risk Score Widget */}
        {riskScore && <RiskScoreWidget score={riskScore.totalScore} level={riskScore.level} />}

        {/* Trend Section */}
        {trends && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('analyzer.trendSection')}
            </Text>
            <Card>
              <View style={styles.trendHeader}>
                <TrendIndicator direction={trends.direction} acceleration={trends.acceleration} />
              </View>

              {/* Moving averages grid */}
              <View style={styles.avgGrid}>
                {trends.movingAverage3d !== null && (
                  <View style={styles.avgItem}>
                    <Text
                      style={[
                        styles.avgValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {trends.movingAverage3d.toFixed(1)}
                    </Text>
                    <Text style={[styles.avgLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.movingAvg3d')}
                    </Text>
                  </View>
                )}
                {trends.movingAverage7d !== null && (
                  <View style={styles.avgItem}>
                    <Text
                      style={[
                        styles.avgValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {trends.movingAverage7d.toFixed(1)}
                    </Text>
                    <Text style={[styles.avgLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.movingAvg7d')}
                    </Text>
                  </View>
                )}
                {trends.movingAverage14d !== null && (
                  <View style={styles.avgItem}>
                    <Text
                      style={[
                        styles.avgValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {trends.movingAverage14d.toFixed(1)}
                    </Text>
                    <Text style={[styles.avgLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.movingAvg14d')}
                    </Text>
                  </View>
                )}
                {trends.movingAverage30d !== null && (
                  <View style={styles.avgItem}>
                    <Text
                      style={[
                        styles.avgValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {trends.movingAverage30d.toFixed(1)}
                    </Text>
                    <Text style={[styles.avgLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.movingAvg30d')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats row */}
              <View style={[styles.statsRow, { borderTopColor: theme.colors.divider }]}>
                {trends.cv !== null && (
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      {trends.cv.toFixed(0)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.cv')}
                    </Text>
                  </View>
                )}
                {trends.timeInRange !== null && (
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      {trends.timeInRange.toFixed(0)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.timeInRange')}
                    </Text>
                  </View>
                )}
                {trends.morningAverage !== null && (
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      {trends.morningAverage.toFixed(1)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      {t('analyzer.morningAvg')}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          </View>
        )}

        {/* Patterns Section */}
        {patterns.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('analyzer.patterns')}
            </Text>
            {patterns.map((p, i) => (
              <Card key={`${p.type}-${i}`} style={styles.patternCard}>
                <View style={styles.patternHeader}>
                  <Icon name="pulse" size={18} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.patternTitle,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {t(PATTERN_LABEL_KEYS[p.type] ?? p.type)}
                  </Text>
                  <View
                    style={[
                      styles.confidenceBadge,
                      {
                        backgroundColor:
                          p.confidence === 'high'
                            ? theme.colors.successLight
                            : p.confidence === 'medium'
                              ? theme.colors.warningLight
                              : theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confidenceText,
                        {
                          color:
                            p.confidence === 'high'
                              ? theme.colors.success
                              : p.confidence === 'medium'
                                ? theme.colors.warning
                                : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {t(
                        `analyzer.confidence${p.confidence.charAt(0).toUpperCase() + p.confidence.slice(1)}`
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.patternDesc, { color: theme.colors.textSecondary }]}>
                  {p.description}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Risk Factor Breakdown */}
        {riskScore && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('analyzer.factors')}
            </Text>
            <Card>
              {riskScore.factors.map((f, i) => (
                <View
                  key={f.name}
                  style={[
                    styles.factorRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: theme.colors.divider },
                  ]}
                >
                  <View style={styles.factorInfo}>
                    <Text
                      style={[
                        styles.factorName,
                        { color: theme.colors.text, fontFamily: theme.fonts.medium },
                      ]}
                    >
                      {t(FACTOR_LABEL_KEYS[f.name] ?? f.name)}
                    </Text>
                    <Text
                      style={[styles.factorDetail, { color: theme.colors.textTertiary }]}
                      numberOfLines={2}
                    >
                      {f.detail}
                    </Text>
                  </View>
                  <View style={styles.factorBar}>
                    <View
                      style={[
                        styles.factorBarBg,
                        { backgroundColor: theme.colors.surfaceSecondary },
                      ]}
                    >
                      <View
                        style={[
                          styles.factorBarFill,
                          {
                            width: `${Math.min(100, f.score)}%`,
                            backgroundColor: getFactorColor(f.score),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.factorScore,
                        { color: getFactorColor(f.score), fontFamily: theme.fonts.semibold },
                      ]}
                    >
                      {f.score}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Icon
            name="shield"
            size={16}
            color={theme.colors.textTertiary}
            style={{ marginTop: 2 }}
          />
          <Text style={[styles.disclaimerText, { color: theme.colors.textTertiary }]}>
            {disclaimer}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17, flex: 1, textAlign: 'center' },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, marginTop: 4 },
  // Empty state
  emptyCard: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  emptySubtitle: { fontSize: 13 },
  // Trend
  trendHeader: { marginBottom: 12 },
  avgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  avgItem: { alignItems: 'center', minWidth: 70, flex: 1 },
  avgValue: { fontSize: 20 },
  avgLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  // Patterns
  patternCard: { padding: 14 },
  patternHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  patternTitle: { fontSize: 14, flex: 1 },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  confidenceText: { fontSize: 11 },
  patternDesc: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  // Factors
  factorRow: { paddingVertical: 10 },
  factorInfo: { marginBottom: 6 },
  factorName: { fontSize: 14 },
  factorDetail: { fontSize: 11, marginTop: 2 },
  factorBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  factorBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  factorBarFill: { height: 6, borderRadius: 3 },
  factorScore: { fontSize: 13, width: 28, textAlign: 'right' },
  // Disclaimer
  disclaimerCard: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12 },
  disclaimerText: { flex: 1, fontSize: 11, lineHeight: 16 },
  // AI CTA
  aiCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  aiCtaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCtaContent: { flex: 1, gap: 2 },
  aiCtaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiCtaTitle: { fontSize: 15, color: '#fff' },
  aiCtaDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 16 },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  proBadgeText: { fontSize: 10, color: '#fff', letterSpacing: 0.5 },
});
