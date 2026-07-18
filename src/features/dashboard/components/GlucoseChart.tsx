import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import {
  GlucoseReading,
  getGlucoseColorFromRanges,
  getGlucoseDirectionFromRanges,
  mmolToMgdl,
} from '@storage/domain/types';
import type { PetSpecies, GlucoseUnit } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { formatShortDate } from '@shared/utils/dateUtils';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

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
  /** Display unit for axis labels. Internal math always runs in mmol/L. */
  unit?: GlucoseUnit;
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

export function GlucoseChart({ data, species, unit = 'mmol/L' }: Props) {
  const glucoseConfig = getSpeciesConfig(species ?? 'cat').glucose;
  const speciesRanges = glucoseConfig.ranges;
  const { t } = useTranslation();
  const { theme } = useTheme();
  // The chart computes everything in mmol/L; only the LABELS convert. Before
  // this, a mg/dL user saw "117 mg/dL" on the status card and a bare "4…9"
  // axis next to it (R4, design audit 2026-07-17).
  const isMgdl = unit === 'mg/dL';
  const axisValue = (vMmol: number) => (isMgdl ? String(mmolToMgdl(vMmol)) : vMmol.toFixed(0));
  const rangeValue = (vMmol: number) => (isMgdl ? String(mmolToMgdl(vMmol)) : String(vMmol));
  const unitLabel = isMgdl ? t('common.mg_dl') : t('common.mmol_l');
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

  // Time-proportional X: previously points were spaced by index, so a 5-day
  // gap between measurements looked identical to a 1-day gap and the chart
  // silently lied about the timeline. Map each day to its real position
  // between the first and last day instead.
  const dayNumber = (dateKey: string) => Math.round(Date.parse(`${dateKey}T12:00:00`) / 86400000);
  const firstDay = dayNumber(daily[0].date);
  const lastDay = dayNumber(daily[daily.length - 1].date);
  const daySpan = Math.max(lastDay - firstDay, 1);
  const getX = (i: number) =>
    daily.length === 1 ? 0 : ((dayNumber(daily[i].date) - firstDay) / daySpan) * CHART_WIDTH;

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

  // Y-axis labels for the data extremes are skipped when they'd overlap the
  // (green) target-range labels — with a tight data range all four crowd
  // into a few pixels.
  const Y_LABEL_MIN_GAP = 12;
  const showMaxLabel = Math.abs(getY(maxVal) - normalMaxY) >= Y_LABEL_MIN_GAP;
  const showMinLabel = Math.abs(getY(minVal) - normalMinY) >= Y_LABEL_MIN_GAP;

  // X-axis label indices — show first, middle, last when >7 days
  const X_LABEL_WIDTH = 44;
  const xLabelCandidates =
    daily.length <= 7
      ? daily.map((_, i) => i)
      : [0, Math.floor(daily.length / 2), daily.length - 1];
  // Drop labels that would overlap a previously kept one (time-proportional
  // positions can put two measured days almost on top of each other); the
  // newest date always survives.
  const xLabelIndices: number[] = [];
  for (const i of xLabelCandidates) {
    const prev = xLabelIndices[xLabelIndices.length - 1];
    if (prev === undefined || getX(i) - getX(prev) >= X_LABEL_WIDTH) {
      xLabelIndices.push(i);
    }
  }
  const lastIdx = daily.length - 1;
  if (!xLabelIndices.includes(lastIdx)) {
    while (
      xLabelIndices.length > 0 &&
      getX(lastIdx) - getX(xLabelIndices[xLabelIndices.length - 1]) < X_LABEL_WIDTH
    ) {
      xLabelIndices.pop();
    }
    xLabelIndices.push(lastIdx);
  }

  return (
    <View style={styles.container}>
      {/* Y-axis labels — positioned to match actual data scale */}
      <View style={styles.yAxis}>
        {showMaxLabel && (
          <Text
            style={[
              styles.axisLabel,
              { color: theme.colors.textTertiary, position: 'absolute', top: getY(maxVal) - 5 },
            ]}
          >
            {axisValue(maxVal)}
          </Text>
        )}
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.success, position: 'absolute', top: getY(normalMax) - 5 },
          ]}
        >
          {rangeValue(normalMax)}
        </Text>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.success, position: 'absolute', top: getY(normalMin) - 5 },
          ]}
        >
          {rangeValue(normalMin)}
        </Text>
        {showMinLabel && (
          <Text
            style={[
              styles.axisLabel,
              { color: theme.colors.textTertiary, position: 'absolute', top: getY(minVal) - 5 },
            ]}
          >
            {axisValue(minVal)}
          </Text>
        )}
      </View>

      {/* Chart area */}
      <View style={[styles.chart, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
        {/* Unit caption — axis numbers are meaningless without it */}
        <Text style={[styles.unitLabel, { color: theme.colors.textTertiary }]}>{unitLabel}</Text>
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

        {/* Data points (daily averages). Marker SHAPE duplicates the danger
            direction so colour-blind users can still tell hypo from hyper:
            ▼ below range, ● in range, ▲ above range. */}
        {daily.map((day, i) => {
          const x = getX(i);
          const y = getY(day.avg);
          const color = getGlucoseColorFromRanges(day.avg, speciesRanges);
          const direction = getGlucoseDirectionFromRanges(day.avg, speciesRanges);
          return (
            <View key={`dot-${day.date}`}>
              <Svg width={12} height={12} style={{ position: 'absolute', left: x - 6, top: y - 6 }}>
                {direction === 'normal' ? (
                  <Circle
                    cx={6}
                    cy={6}
                    r={4}
                    fill={color}
                    stroke={theme.colors.surface}
                    strokeWidth={1.5}
                  />
                ) : (
                  <Polygon
                    points={direction === 'low' ? '1,2 11,2 6,11' : '6,1 11,10 1,10'}
                    fill={color}
                    stroke={theme.colors.surface}
                    strokeWidth={1.5}
                  />
                )}
              </Svg>
              {/* Show count badge when >1 reading per day */}
              {day.count > 1 && (
                <View
                  style={[
                    styles.countBadge,
                    { left: x + 2, top: y - 16, backgroundColor: theme.colors.surfaceSecondary },
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

      {/* X-axis labels — anchored to the labelled point's real x position
          (a space-between row drifted away from the dots once the axis
          became time-proportional) */}
      <View style={styles.xAxis}>
        {xLabelIndices.map(i => {
          const left = Math.min(
            Math.max(getX(i) - X_LABEL_WIDTH / 2, 0),
            CHART_WIDTH - X_LABEL_WIDTH
          );
          return (
            <Text
              key={daily[i].date}
              style={[
                styles.xLabel,
                {
                  color: theme.colors.textTertiary,
                  position: 'absolute',
                  left,
                  width: X_LABEL_WIDTH,
                },
              ]}
              numberOfLines={1}
            >
              {formatShortDate(daily[i].sampleRecordedAt)}
            </Text>
          );
        })}
      </View>

      {/* Legend — mirrors the marker shapes (▼ hypo / ● normal / ▲ hyper) */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={[styles.legendGlyph, { color: theme.colors.glucoseLow }]}>▼</Text>
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartLow')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartNormal', {
              low: rangeValue(normalMin),
              high: rangeValue(normalMax),
              unit: unitLabel,
            })}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={[styles.legendGlyph, { color: theme.colors.glucoseHigh }]}>▲</Text>
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartHigh')}
          </Text>
        </View>
      </View>
      {/* Second legend row explains the non-colour marks: the per-day count
          badge and the vertical min–max spread bar (G6 — every mark on the
          chart must be legible without guessing). */}
      <View style={[styles.legend, { marginTop: 4 }]}>
        <View style={styles.legendItem}>
          <View
            style={[styles.countBadgeLegend, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>N</Text>
          </View>
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartCount')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: `${theme.colors.primary}30` }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('glucose.chartSpread')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  yAxis: { position: 'absolute', left: 0, top: 0, height: CHART_HEIGHT, width: Y_AXIS_WIDTH },
  axisLabel: { fontSize: 11 },
  chart: { marginLeft: Y_AXIS_WIDTH + 4, position: 'relative' },
  normalZone: { position: 'absolute', left: 0, right: 0 },
  rangeBar: { position: 'absolute', width: 3, borderRadius: 1.5 },
  countBadge: { position: 'absolute', borderRadius: 6, paddingHorizontal: 3, paddingVertical: 0.5 },
  countText: { fontSize: 10, fontWeight: '600', fontVariant: ['tabular-nums'] },
  xAxis: {
    height: 14,
    marginTop: 4,
    marginLeft: Y_AXIS_WIDTH + 4,
  },
  xLabel: { fontSize: 11, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendGlyph: { fontSize: 11, lineHeight: 13 },
  countBadgeLegend: { borderRadius: 6, paddingHorizontal: 4, paddingVertical: 0.5 },
  legendBar: { width: 3, height: 12, borderRadius: 1.5 },
  unitLabel: { position: 'absolute', top: 0, right: 2, fontSize: 11, zIndex: 1 },
  legendText: { fontSize: 11 },
});
