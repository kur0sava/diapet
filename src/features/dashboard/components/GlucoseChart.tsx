import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { GlucoseReading } from '@storage/domain/types';
import { format, parseISO } from 'date-fns';

const CHART_HEIGHT = 120;
const NORMAL_MIN = 4.0;
const NORMAL_MAX = 9.0;

interface Props {
  data: GlucoseReading[];
}

export function GlucoseChart({ data }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const CHART_WIDTH = screenWidth - 80;

  if (data.length === 0) return null;

  const values = data.map(d => d.valueMmol);
  const minVal = Math.min(...values, NORMAL_MIN) - 1;
  const maxVal = Math.max(...values, NORMAL_MAX) + 1;
  const range = maxVal - minVal;

  const getY = (v: number) => CHART_HEIGHT - ((v - minVal) / range) * CHART_HEIGHT;
  const getX = (i: number) => (i / Math.max(data.length - 1, 1)) * CHART_WIDTH;

  const pathD = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.valueMmol);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Normal zone Y coordinates
  const normalMaxY = getY(NORMAL_MAX);
  const normalMinY = getY(NORMAL_MIN);

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={[styles.axisLabel, { color: theme.colors.textTertiary }]}>{maxVal.toFixed(0)}</Text>
        <Text style={[styles.axisLabel, { color: theme.colors.success }]}>{NORMAL_MAX}</Text>
        <Text style={[styles.axisLabel, { color: theme.colors.success }]}>{NORMAL_MIN}</Text>
        <Text style={[styles.axisLabel, { color: theme.colors.textTertiary }]}>{minVal.toFixed(0)}</Text>
      </View>

      {/* Simple SVG-like chart using Views */}
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        {/* Normal zone band */}
        <View style={[
          styles.normalZone,
          {
            top: normalMaxY,
            height: normalMinY - normalMaxY,
            backgroundColor: `${theme.colors.success}15`,
          },
        ]} />

        {/* Data points */}
        {data.map((reading, i) => {
          const x = getX(i);
          const y = getY(reading.valueMmol);
          const isLow = reading.valueMmol < NORMAL_MIN;
          const isHigh = reading.valueMmol > NORMAL_MAX;
          const color = isLow || isHigh ? theme.colors.danger : theme.colors.success;
          return (
            <View
              key={reading.id}
              style={[
                styles.dot,
                {
                  left: x - 5,
                  top: y - 5,
                  backgroundColor: color,
                  borderColor: theme.colors.surface,
                },
              ]}
            />
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {data.length <= 7 && data.map((d, i) => (
          <Text
            key={d.id}
            style={[styles.xLabel, { color: theme.colors.textTertiary }]}
            numberOfLines={1}
          >
            {format(parseISO(d.recordedAt), 'dd.MM')}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t('glucose.chartNormal')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t('glucose.chartOutOfRange')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  yAxis: { position: 'absolute', left: 0, top: 0, height: CHART_HEIGHT, justifyContent: 'space-between', width: 0 },
  axisLabel: { fontSize: 9 },
  chart: { marginLeft: 4, position: 'relative' },
  normalZone: { position: 'absolute', left: 0, right: 0 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  xLabel: { fontSize: 9, flex: 1, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
});
