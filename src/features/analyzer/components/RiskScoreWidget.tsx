/**
 * C23: Risk Score Widget — colored circular indicator for Dashboard.
 * Shows overall risk score 0-100 with level-colored ring.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme, type Theme } from '@shared/theme';
import { Card } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import type { RiskLevel } from '../engine/riskScoreCalculator';

interface Props {
  score: number;
  level: RiskLevel;
  onPress?: () => void;
}

function getRiskColor(level: RiskLevel, theme: Theme): string {
  switch (level) {
    case 'excellent': return theme.colors.success;
    case 'good': return theme.colors.primary;
    case 'attention': return theme.colors.warning;
    case 'danger': return theme.colors.danger;
  }
}

function getRiskLabel(level: RiskLevel, t: (key: string) => string): string {
  switch (level) {
    case 'excellent': return t('analyzer.riskExcellent');
    case 'good': return t('analyzer.riskGood');
    case 'attention': return t('analyzer.riskAttention');
    case 'danger': return t('analyzer.riskDanger');
  }
}

const RADIUS = 36;
const STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RiskScoreWidget({ score, level, onPress }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const color = getRiskColor(level, theme);
  // Invert: lower score = better, so fill = (100 - score)%
  const progress = Math.max(0, Math.min(100, 100 - score));
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.ringContainer}>
            <Svg width={86} height={86} viewBox="0 0 86 86">
              <Circle
                cx={43}
                cy={43}
                r={RADIUS}
                stroke={theme.colors.border}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={43}
                cy={43}
                r={RADIUS}
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                rotation={-90}
                origin="43, 43"
              />
            </Svg>
            <View style={styles.scoreOverlay}>
              <Text style={[styles.scoreText, { color, fontFamily: theme.fonts.bold }]}>
                {score}
              </Text>
            </View>
          </View>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}>
              {t('analyzer.healthScore')}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
              <View style={[styles.levelDot, { backgroundColor: color }]} />
              <Text style={[styles.levelText, { color, fontFamily: theme.fonts.semibold }]}>
                {getRiskLabel(level, t)}
              </Text>
            </View>
            {onPress && (
              <View style={styles.detailsRow}>
                <Text style={[styles.detailsText, { color: theme.colors.primary, fontFamily: theme.fonts.medium }]}>
                  {t('analyzer.viewDetails')}
                </Text>
                <Icon name="chevron-forward" size={14} color={theme.colors.primary} />
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringContainer: { width: 86, height: 86, alignItems: 'center', justifyContent: 'center' },
  scoreOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 24 },
  info: { flex: 1, gap: 6 },
  title: { fontSize: 16 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelText: { fontSize: 13 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  detailsText: { fontSize: 13 },
});
