/**
 * Combined chart: actual glucose data (solid) + predicted (dashed) + confidence band.
 */
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { GlucoseReading, getGlucoseColorFromRanges } from '@storage/domain/types';
import type { PetSpecies } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { formatShortDate } from '@shared/utils/dateUtils';
import Svg, { Path, Line } from 'react-native-svg';
import type { GlucosePredictionPoint } from '../data/predictionTypes';

const CHART_HEIGHT = 140;
const Y_AXIS_WIDTH = 30;
const NORMAL_MIN = 4.0;
const NORMAL_MAX = 9.0;

interface Props {
  actualData: GlucoseReading[];
  predictions: GlucosePredictionPoint[];
  species?: PetSpecies;
}

export function PredictionChart({ actualData, predictions, species }: Props) {
  const speciesRanges = getSpeciesConfig(species ?? 'cat').glucose.ranges;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const CHART_WIDTH = Math.max(screenWidth - 80 - Y_AXIS_WIDTH, 50);

  if (actualData.length === 0 && predictions.length === 0) return null;
  if (actualData.length === 0) return null; // Need actual data to anchor predictions

  // Combine all values for scale — use reduce to avoid stack overflow on large arrays
  const actualValues = actualData.map(d => d.valueMmol);
  const predValues = predictions.map(p => p.predictedMmol);
  const confLow = predictions.map(p => p.confidenceLow);
  const confHigh = predictions.map(p => p.confidenceHigh);
  const allValues = [...actualValues, ...predValues, ...confLow, ...confHigh];

  const minVal = allValues.reduce((a, b) => Math.min(a, b), NORMAL_MIN) - 1;
  const maxVal = allValues.reduce((a, b) => Math.max(a, b), NORMAL_MAX) + 1;
  const range = maxVal - minVal;

  const totalPoints = actualData.length + predictions.length;
  const getY = (v: number) => CHART_HEIGHT - ((v - minVal) / range) * CHART_HEIGHT;
  const getX = (i: number) => (i / Math.max(totalPoints - 1, 1)) * CHART_WIDTH;

  // Actual data path
  const actualPathD = actualData
    .map((d, i) => {
      const x = getX(i);
      const y = getY(d.valueMmol);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Predicted data path (dashed)
  const predStartIdx = actualData.length;
  const predPathD = predictions
    .map((p, i) => {
      const idx = predStartIdx + i;
      const x = getX(idx);
      const y = getY(p.predictedMmol);
      // Connect from last actual point
      if (i === 0 && actualData.length > 0) {
        const lastActual = actualData[actualData.length - 1];
        const lastX = getX(actualData.length - 1);
        const lastY = getY(lastActual.valueMmol);
        return `M ${lastX} ${lastY} L ${x} ${y}`;
      }
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Confidence band path (closed polygon)
  let confBandD = '';
  if (predictions.length > 0) {
    // Top edge (left to right)
    const topEdge = predictions
      .map((p, i) => {
        const x = getX(predStartIdx + i);
        const y = getY(p.confidenceHigh);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
    // Bottom edge (right to left)
    const bottomEdge = [...predictions]
      .reverse()
      .map((p, i) => {
        const origIdx = predictions.length - 1 - i;
        const x = getX(predStartIdx + origIdx);
        const y = getY(p.confidenceLow);
        return `L ${x} ${y}`;
      })
      .join(' ');
    confBandD = `${topEdge} ${bottomEdge} Z`;
  }

  // Normal zone
  const normalMaxY = getY(NORMAL_MAX);
  const normalMinY = getY(NORMAL_MIN);

  // "Today" divider line
  const todayX = actualData.length > 0 ? getX(actualData.length - 1) : 0;

  // X-axis labels
  const labelIndices: number[] = [];
  if (totalPoints > 0) {
    labelIndices.push(0);
    if (actualData.length > 1 && predictions.length > 0) {
      labelIndices.push(actualData.length - 1); // today
    }
    if (predictions.length > 0) {
      labelIndices.push(totalPoints - 1); // last prediction
    }
  }

  function getLabel(idx: number): string {
    if (idx < actualData.length) {
      return formatShortDate(actualData[idx].recordedAt);
    }
    const predIdx = idx - actualData.length;
    if (predIdx < predictions.length) {
      return formatShortDate(predictions[predIdx].date);
    }
    return '';
  }

  return (
    <View style={styles.container}>
      {/* Y-axis — positioned to match actual data scale */}
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
            { color: theme.colors.success, position: 'absolute', top: getY(NORMAL_MAX) - 5 },
          ]}
        >
          {NORMAL_MAX}
        </Text>
        <Text
          style={[
            styles.axisLabel,
            { color: theme.colors.success, position: 'absolute', top: getY(NORMAL_MIN) - 5 },
          ]}
        >
          {NORMAL_MIN}
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

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={StyleSheet.absoluteFill}>
          {/* Confidence band */}
          {confBandD ? <Path d={confBandD} fill={`${theme.colors.info}20`} stroke="none" /> : null}

          {/* Actual data line */}
          {actualData.length > 1 && (
            <Path
              d={actualPathD}
              stroke={theme.colors.primary}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Predicted data line (dashed) */}
          {predictions.length > 0 && predPathD && (
            <Path
              d={predPathD}
              stroke={theme.colors.info}
              strokeWidth={2}
              fill="none"
              strokeDasharray="6,4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* "Today" divider */}
          {actualData.length > 0 && predictions.length > 0 && (
            <Line
              x1={todayX}
              y1={0}
              x2={todayX}
              y2={CHART_HEIGHT}
              stroke={theme.colors.textTertiary}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          )}
        </Svg>

        {/* Actual data points */}
        {actualData.map((reading, i) => {
          const x = getX(i);
          const y = getY(reading.valueMmol);
          const color = getGlucoseColorFromRanges(reading.valueMmol, speciesRanges);
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

        {/* Predicted data points */}
        {predictions.map((p, i) => {
          const x = getX(predStartIdx + i);
          const y = getY(p.predictedMmol);
          return (
            <View
              key={`pred-${p.date}`}
              style={[
                styles.predDot,
                {
                  left: x - 4,
                  top: y - 4,
                  backgroundColor: theme.colors.info,
                  borderColor: theme.colors.surface,
                },
              ]}
            />
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        {labelIndices.map(i => (
          <Text
            key={`label-${i}`}
            style={[styles.xLabel, { color: theme.colors.textTertiary }]}
            numberOfLines={1}
          >
            {getLabel(i)}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('prediction.chartActual')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDash, { borderColor: theme.colors.info }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('prediction.chartPredicted')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBand, { backgroundColor: `${theme.colors.info}30` }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            {t('prediction.chartConfidence')}
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
  predDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: Y_AXIS_WIDTH + 4,
  },
  xLabel: { fontSize: 9, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 14, marginTop: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendLine: { width: 14, height: 2, borderRadius: 1 },
  legendDash: { width: 14, height: 0, borderTopWidth: 2, borderStyle: 'dashed' },
  legendBand: { width: 14, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11 },
});
