/**
 * Advanced Analytics screen — AI glucose prediction, checklist, remission report.
 * Pro-gated: free users see paywall prompt.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { usePetStore } from '@shared/stores/petStore';
import { glucoseRepository } from '@storage/database';
import { Card } from '@shared/components/ui';
import { useSubscription } from '@features/subscription/hooks/useSubscription';
import { useRootNavigation } from '@navigation/hooks';

import { usePrediction } from '../hooks/usePrediction';
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
  const { canAccessAdvanced } = useSubscription();

  // Pro-gate: redirect free users to paywall
  useEffect(() => {
    if (!canAccessAdvanced()) {
      rootNav.navigate('Paywall');
      navigation.goBack();
    }
  }, [canAccessAdvanced, rootNav, navigation]);

  const {
    prediction,
    isLoading,
    error,
    canRequestNew,
    nextAvailableIn,
    requestNewPrediction,
  } = usePrediction();

  // Load recent glucose readings for the chart
  const { data: recentReadings = [] } = useQuery({
    queryKey: ['glucose', 'last7', activePet?.id],
    queryFn: () => activePet ? glucoseRepository.findLast7Days(activePet.id) : Promise.resolve([]),
    enabled: !!activePet?.id,
  });

  // Format countdown timer
  const formatCountdown = useCallback((ms: number): string => {
    if (ms <= 0) return '';
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}${t('prediction.hours')} ${minutes}${t('prediction.minutes')}`;
  }, [t]);

  // Countdown state for rate limit display
  const [countdown, setCountdown] = useState(nextAvailableIn);
  useEffect(() => {
    setCountdown(nextAvailableIn);
    if (nextAvailableIn <= 0) return;
    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 60_000));
    }, 60_000);
    return () => clearInterval(interval);
  }, [nextAvailableIn]);

  const hasPrediction = prediction && prediction.status !== 'error';
  const isInsufficientData = prediction?.status === 'insufficient_data';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>
              {'\u2190 '}{t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('prediction.title')}
          </Text>
          <View style={{ width: 60 }} />
        </View>
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
        {/* Disclaimer — always visible */}
        <DisclaimerBanner
          text={prediction?.disclaimer ?? t('prediction.defaultDisclaimer')}
        />

        {/* Error state */}
        {error && (
          <Card style={[styles.errorCard, { borderColor: theme.colors.danger }]}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
            <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
          </Card>
        )}

        {/* No prediction yet */}
        {!hasPrediction && !isLoading && !error && (
          <Card style={styles.emptyCard}>
            <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
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
            <Ionicons name="information-circle" size={24} color={theme.colors.warning} />
            <Text style={[styles.insufficientTitle, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
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
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
              {t('prediction.chartTitle')}
            </Text>
            <Card>
              <PredictionChart
                actualData={recentReadings}
                predictions={prediction.predictions}
              />
            </Card>
          </View>
        )}

        {/* Summary */}
        {prediction?.status === 'success' && prediction.summary && (
          <Card style={styles.summaryCard}>
            <Ionicons name="analytics" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.summaryText, { color: theme.colors.text }]}>
              {prediction.summary}
            </Text>
          </Card>
        )}

        {/* Checklist */}
        {prediction?.status === 'success' && prediction.checklist.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
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
              <Ionicons name="stats-chart" size={16} color={theme.colors.textSecondary} />
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
            colors={isLoading || !canRequestNew
              ? [theme.colors.textTertiary, theme.colors.textTertiary]
              : [...theme.gradients.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.requestBtn}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" style={{ marginRight: 8 }} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
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
  requestBtn: { paddingVertical: 16, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  requestBtnText: { color: '#fff', fontSize: 16 },
  countdownText: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  lastUpdated: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
