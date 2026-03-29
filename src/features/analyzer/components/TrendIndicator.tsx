/**
 * C24: Trend Indicator — arrow + text showing glucose trend direction.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type Theme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import type { TrendDirection, TrendAcceleration } from '../engine/trendEngine';

interface Props {
  direction: TrendDirection | null;
  acceleration?: TrendAcceleration | null;
  compact?: boolean;
}

function getDirectionIcon(dir: TrendDirection | null): string {
  switch (dir) {
    case 'improving': return 'trending-down';
    case 'worsening': return 'trending-up';
    case 'stable': return 'remove-outline';
    default: return 'remove-outline';
  }
}

function getDirectionColor(dir: TrendDirection | null, theme: Theme): string {
  switch (dir) {
    case 'improving': return theme.colors.success;
    case 'worsening': return theme.colors.danger;
    case 'stable': return theme.colors.primary;
    default: return theme.colors.textTertiary;
  }
}

function getDirectionLabel(dir: TrendDirection | null, t: (key: string) => string): string {
  switch (dir) {
    case 'improving': return t('analyzer.trendImproving');
    case 'worsening': return t('analyzer.trendWorsening');
    case 'stable': return t('analyzer.trendStable');
    default: return t('analyzer.trendNoData');
  }
}

function getAccelerationLabel(acc: TrendAcceleration | null | undefined, t: (key: string) => string): string | null {
  switch (acc) {
    case 'accelerating': return t('analyzer.trendAccelerating');
    case 'decelerating': return t('analyzer.trendDecelerating');
    case 'steady': return t('analyzer.trendSteady');
    default: return null;
  }
}

export function TrendIndicator({ direction, acceleration, compact }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const color = getDirectionColor(direction, theme);
  const label = getDirectionLabel(direction, t);
  const accLabel = getAccelerationLabel(acceleration, t);

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: color + '20' }]}>
        <Icon name={getDirectionIcon(direction)} size={14} color={color} />
        <Text style={[styles.compactText, { color, fontFamily: theme.fonts.semibold }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <Icon name={getDirectionIcon(direction)} size={20} color={color} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color, fontFamily: theme.fonts.semibold }]}>{label}</Text>
        {accLabel && (
          <Text style={[styles.accText, { color: theme.colors.textSecondary }]}>{accLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textCol: { gap: 2 },
  label: { fontSize: 14 },
  accText: { fontSize: 12 },
  compactBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  compactText: { fontSize: 12 },
});
