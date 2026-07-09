import { GlucoseReading, getGlucoseLevel, getGlucoseLevelFromRanges } from '@storage/domain/types';
import { getTirBounds, type SpeciesConfig } from '@shared/config/speciesConfig';

export type DiaryRecommendation = {
  type: 'critical' | 'warning' | 'info' | 'good';
  messageKey: string;
  params?: Record<string, string | number>;
};

export type DayStats = {
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
  inRangePercent: number | null;
};

export function computeDayStats(readings: GlucoseReading[], config?: SpeciesConfig): DayStats {
  if (readings.length === 0) {
    return { avg: null, min: null, max: null, count: 0, inRangePercent: null };
  }
  // M001: same TIR band as the analyzer dashboard (targetLow..rangeHigh) —
  // the diary used targetHigh and showed a different "% in range" for the
  // same data.
  const tir = getTirBounds(config);
  const values = readings.map(r => r.valueMmol);
  const sum = values.reduce((a, b) => a + b, 0);
  const avg = Math.round((sum / values.length) * 10) / 10;
  const min = Math.round(Math.min(...values) * 10) / 10;
  const max = Math.round(Math.max(...values) * 10) / 10;
  const inRange = values.filter(v => v >= tir.low && v <= tir.high).length;
  const inRangePercent = Math.round((inRange / values.length) * 100);
  return { avg, min, max, count: values.length, inRangePercent };
}

export function analyzeDayGlucose(
  readings: GlucoseReading[],
  config?: SpeciesConfig
): DiaryRecommendation[] {
  if (readings.length === 0) {
    return [{ type: 'info', messageKey: 'diary.advice.noData' }];
  }

  const recommendations: DiaryRecommendation[] = [];
  const stats = computeDayStats(readings, config);
  const ranges = config?.glucose.ranges;
  const levelOf = (v: number) =>
    ranges ? getGlucoseLevelFromRanges(v, ranges) : getGlucoseLevel(v);

  // Check for critical low readings
  const severeLows = readings.filter(r => levelOf(r.valueMmol) === 'severe_low');
  if (severeLows.length > 0) {
    recommendations.push({ type: 'critical', messageKey: 'diary.advice.severeLow' });
  }

  // Check for hypoglycemia (low readings)
  const lowReadings = readings.filter(r => {
    const lvl = levelOf(r.valueMmol);
    return lvl === 'low' || lvl === 'below_target';
  });
  if (lowReadings.length > 0 && severeLows.length === 0) {
    recommendations.push({
      type: 'warning',
      messageKey: 'diary.advice.lowGlucose',
      params: { count: lowReadings.length },
    });
  }

  // Check for hyperglycemia: any very_high, or 2+ high readings
  const highReadings = readings.filter(r => {
    const lvl = levelOf(r.valueMmol);
    return lvl === 'high' || lvl === 'very_high';
  });
  const veryHighReadings = highReadings.filter(r => levelOf(r.valueMmol) === 'very_high');
  if (veryHighReadings.length >= 1 || highReadings.length >= 2) {
    recommendations.push({
      type: 'warning',
      messageKey: 'diary.advice.highGlucose',
      params: { count: highReadings.length },
    });
  }

  // In-range assessment — only show goodControl if no warnings/criticals already present
  const hasWarnings = recommendations.some(r => r.type === 'critical' || r.type === 'warning');
  if (stats.inRangePercent !== null) {
    if (stats.inRangePercent >= 80 && !hasWarnings) {
      recommendations.push({
        type: 'good',
        messageKey: 'diary.advice.goodControl',
        params: { percent: stats.inRangePercent },
      });
    } else if (stats.inRangePercent < 50 && recommendations.length === 0) {
      recommendations.push({
        type: 'warning',
        messageKey: 'diary.advice.poorControl',
        params: { percent: stats.inRangePercent },
      });
    }
  }

  // Wide spread warning
  if (stats.min !== null && stats.max !== null && stats.max - stats.min > 8) {
    recommendations.push({ type: 'info', messageKey: 'diary.advice.wideSpread' });
  }

  return recommendations.length > 0
    ? recommendations
    : [
        {
          type: 'good',
          messageKey: 'diary.advice.goodControl',
          params: { percent: stats.inRangePercent ?? 100 },
        },
      ];
}
