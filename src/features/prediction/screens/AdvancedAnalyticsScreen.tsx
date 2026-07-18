/**
 * Advanced Analytics screen — AI glucose prediction, checklist, remission report.
 * Pro-gated: free users see paywall prompt.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { usePetStore } from '@shared/stores/petStore';
import { glucoseRepository } from '@storage/database';
import { Card, ScreenHeader } from '@shared/components/ui';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { useRootNavigation } from '@navigation/hooks';
import { isAiFeatureVisible } from '@shared/config/runtimeConfig';
import { isAiConfigured } from '@features/hints/utils/aiClient';

import { usePrediction } from '../hooks/usePrediction';
import { timeUntilNextPrediction } from '../data/predictionStorage';
import { PredictionChart } from '../components/PredictionChart';
import { ChecklistCard } from '../components/ChecklistCard';
import { RemissionCard } from '../components/RemissionCard';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export default function AdvancedAnalyticsScreen() {
  const navigation = useNavigation();
  const rootNav = useRootNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const petId = activePet?.id;
  const { canAccessAdvanced, isMonetizationEnabled } = useSubscription();
  const hasAccess = canAccessAdvanced();
  const aiVisible = isAiFeatureVisible();
  const aiReady = isAiConfigured();

  // Pro-gate: redirect free users to paywall (run once on mount)
  useEffect(() => {
    if (aiVisible && aiReady && !hasAccess && isMonetizationEnabled) {
      rootNav.navigate('Paywall');
      if (navigation.canGoBack()) navigation.goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiVisible, aiReady, hasAccess, isMonetizationEnabled]);

  const { prediction, isLoading, error, canRequestNew, nextAvailableIn, requestNewPrediction } =
    usePrediction();

  // Load recent glucose readings for the chart
  const { data: recentReadings = [] } = useQuery({
    queryKey: queryKeys.glucose.last7(activePet?.id ?? ''),
    queryFn: () =>
      activePet ? glucoseRepository.findLast7Days(activePet.id) : Promise.resolve([]),
    enabled: !!activePet?.id,
  });

  // Format countdown timer
  const formatCountdown = useCallback(
    (ms: number): string => {
      if (ms <= 0) return '';
      const hours = Math.floor(ms / (60 * 60 * 1000));
      const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
      return `${hours}${t('prediction.hours')} ${minutes}${t('prediction.minutes')}`;
    },
    [t]
  );

  // Countdown state for rate limit display — recalculates on app resume
  const [countdown, setCountdown] = useState(nextAvailableIn);
  useEffect(() => {
    setCountdown(nextAvailableIn);
    if (nextAvailableIn <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 60_000));
    }, 60_000);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && petId) {
        setCountdown(timeUntilNextPrediction(petId));
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [nextAvailableIn, petId]);

  const backendReady = true;
  const hasPrediction = prediction && prediction.status !== 'error';
  const isInsufficientData = prediction?.status === 'insufficient_data';

  if (!aiVisible || !aiReady) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View>
          <ScreenHeader title={t('prediction.title')} onBack={() => navigation.goBack()} />
          <LinearGradient
            colors={[...theme.gradients.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3 }}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Card style={styles.comingSoonCard}>
            <View style={[styles.comingSoonIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Icon name="sparkles" size={40} color={theme.colors.primary} />
            </View>
            <Text
              style={[
                styles.comingSoonTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('prediction.comingSoonTitle')}
            </Text>
            <Text style={[styles.comingSoonDesc, { color: theme.colors.textSecondary }]}>
              {t('subscription.notAvailable')}
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View>
        <ScreenHeader title={t('prediction.title')} onBack={() => navigation.goBack()} />
        <LinearGradient
          colors={[...theme.gradients.primary] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 3 }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={canRequestNew ? requestNewPrediction : undefined}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Coming Soon — backend not configured */}
        {!backendReady ? (
          <Card style={styles.comingSoonCard}>
            <View style={[styles.comingSoonIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Icon name="sparkles" size={40} color={theme.colors.primary} />
            </View>
            <Text
              style={[
                styles.comingSoonTitle,
                { color: theme.colors.text, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('prediction.comingSoonTitle')}
            </Text>
            <Text style={[styles.comingSoonDesc, { color: theme.colors.textSecondary }]}>
              {t('prediction.comingSoonDesc')}
            </Text>

            <View style={styles.proFeaturesList}>
              <Text
                style={[
                  styles.proFeaturesLabel,
                  { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('prediction.comingSoonIncluded')}
              </Text>
              {[
                { icon: 'sparkles' as const, label: t('subscription.features.aiPrediction') },
                {
                  icon: 'chatbubble-ellipses' as const,
                  label: t('subscription.features.aiAssistant'),
                },
                { icon: 'analytics' as const, label: t('subscription.features.advancedAnalytics') },
                { icon: 'document-text' as const, label: t('subscription.features.pdfExport') },
                { icon: 'paw' as const, label: t('subscription.features.unlimitedPets') },
                { icon: 'calculator' as const, label: t('subscription.features.feedCalculator') },
              ].map((item, i) => (
                <View key={i} style={styles.proFeatureRow}>
                  <Icon name={item.icon} size={16} color={theme.colors.primary} />
                  <Text style={[styles.proFeatureText, { color: theme.colors.textSecondary }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[styles.comingSoonBadge, { backgroundColor: `${theme.colors.success}15` }]}
            >
              <Icon name="gift-outline" size={18} color={theme.colors.success} />
              <Text
                style={[
                  styles.comingSoonBadgeText,
                  { color: theme.colors.success, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('subscription.allFeaturesUnlocked')}
              </Text>
            </View>
          </Card>
        ) : (
          <>
            {/* Disclaimer — always visible */}
            <DisclaimerBanner text={prediction?.disclaimer ?? t('prediction.defaultDisclaimer')} />

            {/* Error state */}
            {error && (
              <Card style={[styles.errorCard, { borderColor: theme.colors.danger }]}>
                <Icon name="alert-circle" size={20} color={theme.colors.danger} />
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </Card>
            )}

            {/* No prediction yet */}
            {!hasPrediction && !isLoading && !error && (
              <Card style={styles.emptyCard}>
                <Icon name="sparkles" size={40} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('prediction.emptyTitle')}
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {t('prediction.emptySubtitle')}
                </Text>
              </Card>
            )}

            {/* Insufficient data */}
            {isInsufficientData && prediction && (
              <Card style={styles.insufficientCard}>
                <Icon name="information-circle" size={24} color={theme.colors.warning} />
                <Text
                  style={[
                    styles.insufficientTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t('prediction.insufficientData')}
                </Text>
                <Text style={[styles.insufficientText, { color: theme.colors.textSecondary }]}>
                  {prediction.summary}
                </Text>
              </Card>
            )}

            {/* Prediction chart */}
            {prediction?.status === 'success' && prediction.predictions.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('prediction.chartTitle')}
                </Text>
                <Card>
                  <PredictionChart
                    actualData={recentReadings}
                    predictions={prediction.predictions}
                    species={activePet?.species}
                  />
                </Card>
              </View>
            )}

            {/* Summary */}
            {prediction?.status === 'success' && prediction.summary && (
              <Card style={styles.summaryCard}>
                <Icon
                  name="analytics"
                  size={20}
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                  {prediction.summary}
                </Text>
              </Card>
            )}

            {/* Checklist */}
            {prediction?.status === 'success' && prediction.checklist.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('prediction.checklistTitle')}
                </Text>
                <ChecklistCard items={prediction.checklist} />
              </View>
            )}

            {/* Remission report */}
            {prediction?.remission && (
              <View style={styles.section}>
                <RemissionCard report={prediction.remission} />
              </View>
            )}

            {/* Data quality */}
            {recentReadings.length > 0 && (
              <Card style={styles.dataQualityCard}>
                <View style={styles.dataQualityRow}>
                  <Icon name="stats-chart" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.dataQualityText, { color: theme.colors.textSecondary }]}>
                    {t('prediction.readingsCount', { count: recentReadings.length })}
                  </Text>
                </View>
              </Card>
            )}

            {/* Request button */}
            <TouchableOpacity
              onPress={requestNewPrediction}
              disabled={isLoading || !canRequestNew}
              activeOpacity={0.8}
              style={{ marginTop: 16 }}
            >
              <LinearGradient
                colors={
                  isLoading || !canRequestNew
                    ? [theme.colors.textTertiary, theme.colors.textTertiary]
                    : ([...theme.gradients.primary] as [string, string])
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.requestBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={[styles.requestBtnText, { fontFamily: theme.fonts.bold }]}>
                      {canRequestNew
                        ? t('prediction.requestAnalysis')
                        : t('prediction.rateLimited')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Rate limit countdown */}
            {!canRequestNew && countdown > 0 && (
              <Text style={[styles.countdownText, { color: theme.colors.textTertiary }]}>
                {t('prediction.nextAvailableIn', { time: formatCountdown(countdown) })}
              </Text>
            )}

            {/* Last updated */}
            {prediction?.generatedAt && (
              <Text style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}>
                {t('prediction.lastUpdated')}: {new Date(prediction.generatedAt).toLocaleString()}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, marginTop: 4 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, padding: 12 },
  errorText: { flex: 1, fontSize: 13 },
  emptyCard: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 },
  insufficientCard: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  insufficientTitle: { fontSize: 16 },
  insufficientText: { fontSize: 13, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 },
  summaryCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  summaryText: { flex: 1, fontSize: 14, lineHeight: 20 },
  dataQualityCard: { padding: 12 },
  dataQualityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dataQualityText: { fontSize: 13 },
  requestBtn: {
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnText: { color: '#fff', fontSize: 16 },
  countdownText: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  lastUpdated: { fontSize: 11, textAlign: 'center', marginTop: 8 },
  comingSoonCard: { alignItems: 'center', paddingVertical: 28, gap: 12 },
  comingSoonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  comingSoonTitle: { fontSize: 20, textAlign: 'center' },
  comingSoonDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
  proFeaturesList: { width: '100%', gap: 8, marginTop: 8 },
  proFeaturesLabel: { fontSize: 14, marginBottom: 4 },
  proFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  proFeatureText: { fontSize: 14 },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  comingSoonBadgeText: { fontSize: 14 },
});
