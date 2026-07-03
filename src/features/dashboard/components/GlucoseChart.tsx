import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { GlucoseReading, getGlucoseColorFromRanges } from '@storage/domain/types';
import type { PetSpecies } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { formatShortDate } from '@shared/utils/dateUtils';
import Svg, { Path } from 'react-native-svg';

const CHART_HEIGHT = 120;
const Y_AXIS_WIDTH = 30;

interface DailyPoint {
  date: string; // YYYY-MM-DD
  avg: number;
  min: number;
  max: number;
  count: number;
  /** ISO string of one reading for date formatting */
  sampleRecordedAt: string;
}

interface Props {
  data: GlucoseReading[];
  species?: PetSpecies;
}

/** Aggregate readings by calendar day (local timezone). */
function aggregateByDay(readings: GlucoseReading[]): DailyPoint[] {
  const byDay = new Map<string, number[]>();
  const sampleByDay = new Map<string, string>();

  for (const r of readings) {
    // Use local date (not UTC) so grouping matches user's calendar
    const d = new Date(r.recordedAt);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const vals = byDay.get(dayKey) ?? [];
    vals.push(r.valueMmol);
    byDay.set(dayKey, vals);
    if (!sampleByDay.has(dayKey)) sampleByDay.set(dayKey, r.recordedAt);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date,
      avg: vals.reduce((s, v) => s + v, 0) / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
      count: vals.length,
      sampleRecordedAt: sampleByDay.get(date)!,
    }));
}

export function GlucoseChart({ data, species }: Props) {
  const glucoseConfig = getSpeciesConfig(species ?? 'cat').glucose;
  const speciesRanges = glucoseConfig.ranges;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const CHART_WIDTH = Math.max(screenWidth - 80 - Y_AXIS_WIDTH, 50);

  if (data.length === 0) return null;

  const daily = aggregateByDay(data);

  if (daily.length === 0) return null;

  const allMins = daily.map(d => d.min);
  const allMaxs = daily.map(d => d.max);
  const normalMin = glucoseConfig.targetLow;
  const normalMax = glucoseConfig.targetHigh;
  const minVal = Math.min(Math.min(...allMins), normalMin) - 1;
  const maxVal = Math.max(Math.max(...allMaxs), normalMax) + 1;
  const range = maxVal - minVal;

  const getY = (v: number) => CHART_HEIGHT - ((v - minVal) / range) * CHART_HEIGHT;
  const getX = (i: number) => (i / Math.max(daily.length - 1, 1)) * CHART_WIDTH;

  // SVG path connecting daily averages
  const pathD = daily
    .map((d, i) => {
      const x = getX(i);
      const y = getY(d.avg);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Normal zone Y coordinates
  const normalMaxY = getY(normalMax);
  const normalMinY = getY(normalMin);

  // X-axis label indices — show first, middle, last when >7 days
  const xLabelIndices =
    daily.length <= 7
      ? daily.map((_, i) => i)
      : [0, Math.floor(daily.length / 2), daily.length - 1];

  return (
    <View style={styles.container}>
      {/* Y-axis labels — positioned to match actual data scale */}
      <View style={styles.yAxis}>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.textTertiary, position: 'absolute', top: getY(maxVal) - 5 },
          ]}
        >
          {maxVal.toFixed(0)}
        </Text>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.success, position: 'absolute', top: getY(normalMax) - 5 },
          ]}
        >
          {normalMax}
        </Text>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.success, position: 'absolute', top: getY(normalMin) - 5 },
          ]}
        >
          {normalMin}
        </Text>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.textTertiary, position: 'absolute', top: getY(minVal) - 5 },
          ]}
        >
          {minVal.toFixed(0)}
        </Text>
      </View>

      {/* Chart area */}
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        {/* Normal zone band */}
        <View
          style={[
            styles.normalZone,
            {
              top: normalMaxY,
              height: normalMinY - normalMaxY,
              backgroundColor: `${theme.colors.success}15`,
            },
          ]}
        />

        {/* Min-max range bars per day (shows spread) */}
        {daily.map((day, i) => {
          if (day.count < 2) return null;
          const x = getX(i);
          const yTop = getY(day.max);
          const yBottom = getY(day.min);
          const barHeight = Math.max(yBottom - yTop, 1);
          return (
            <View
              key={`range-${day.date}`}
              style={[
                styles.rangeBar,
                {
                  left: x - 1.5,
                  top: yTop,
                  height: barHeight,
                  backgroundColor: `${theme.colors.primary}30`,
                },
              ]}
            />
          );
        })}

        {/* Connecting line */}
        {daily.length > 1 && (
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={StyleSheet.absoluteFill}>
            <Path
              d={pathD}
              stroke={theme.colors.primary}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6}
            />
          </Svg>
        )}

        {/* Data points (daily averages) */}
        {daily.map((day, i) => {
          const x = getX(i);
          const y = getY(day.avg);
          const color = getGlucoseColorFromRanges(day.avg, speciesRanges);
          return (
            <View key={`dot-${day.date}`}>
              <View
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
              {/* Show count badge when >1 reading per day */}
              {day.count > 1 && (
                <View
                  style={[
                    styles.countBadge,
                    { left: x + 2, top: y - 14, backgroundColor: theme.colors.surfaceSecondary },
                  ]}
                >
                  <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
                    {day.count}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {xLabelIndices.map(i => (
          <Text
            key={daily[i].date}
            style={[styles.xLabel, { color: theme.colors.textTertiary }]}
            numberOfLines={1}
          >
            {formatShortDate(daily[i].sampleRecordedAt)}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartNormal')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartOutOfRange')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  yAxis: { position: 'absolute', left: 0, top: 0, height: CHART_HEIGHT, width: Y_AXIS_WIDTH },
  axisLabel: { fontSize: 9 },
  chart: { marginLeft: Y_AXIS_WIDTH + 4, position: 'relative' },
  normalZone: { position: 'absolute', left: 0, right: 0 },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  rangeBar: { position: 'absolute', width: 3, borderRadius: 1.5 },
  countBadge: { position: 'absolute', borderRadius: 6, paddingHorizontal: 3, paddingVertical: 0.5 },
  countText: { fontSize: 8, fontWeight: '600' },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: Y_AXIS_WIDTH + 4,
  },
  xLabel: { fontSize: 9, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
});
