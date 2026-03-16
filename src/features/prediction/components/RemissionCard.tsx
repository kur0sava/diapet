/**
 * Weekly remission probability report card.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useTranslation } from 'react-i18next';
import type { RemissionReport, RemissionProbability } from '../data/predictionTypes';
import { formatShortDate } from '@shared/utils/dateUtils';

interface Props {
  report: RemissionReport;
}

export function RemissionCard({ report }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const probabilityConfig: Record<RemissionProbability, { color: string; labelKey: string }> = {
    very_low: { color: theme.colors.danger, labelKey: 'prediction.remissionVeryLow' },
    low: { color: theme.colors.warning, labelKey: 'prediction.remissionLow' },
    moderate: { color: '#EAB308', labelKey: 'prediction.remissionModerate' },
    high: { color: theme.colors.success, labelKey: 'prediction.remissionHigh' },
  };

  const config = probabilityConfig[report.probability];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
      {/* Header with probability badge */}
      <View style={styles.header}>
        <Ionicons name="trending-up" size={20} color={config.color} />
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {t('prediction.remissionTitle')}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>
            {t(config.labelKey)} ({report.probabilityPercent}%)
          </Text>
        </View>
      </View>

      {/* Factors */}
      <View style={styles.factors}>
        {report.factors.map((factor, i) => {
          const isPositive = factor.startsWith('+');
          const icon = isPositive ? 'add-circle' : 'remove-circle';
          const color = isPositive ? theme.colors.success : theme.colors.danger;
          const text = factor.startsWith('+') || factor.startsWith('-') ? factor.slice(1).trim() : factor;

          return (
            <View key={i} style={styles.factorRow}>
              <Ionicons name={icon} size={16} color={color} />
              <Text style={[styles.factorText, { color: theme.colors.text }]}>{text}</Text>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <Text style={[styles.summary, { color: theme.colors.textSecondary }]}>
        {report.summary}
      </Text>

      {/* Generated date */}
      <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
        {t('prediction.generatedAt')}: {formatShortDate(report.generatedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  headerTitle: { fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  factors: { marginTop: 12, gap: 6 },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  factorText: { fontSize: 13, flex: 1 },
  summary: { fontSize: 13, lineHeight: 18, marginTop: 12 },
  date: { fontSize: 11, marginTop: 8 },
});
