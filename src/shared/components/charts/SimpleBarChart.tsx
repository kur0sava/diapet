import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@shared/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  title?: string;
  height?: number;
  unit?: string;
}

export function SimpleBarChart({ data, title, height = 140, unit }: Props) {
  const { theme } = useTheme();

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(
    (SCREEN_WIDTH - 80) / data.length - 4,
    32
  );

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      )}
      <View style={[styles.chartArea, { height }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.axisLabel, { color: theme.colors.textTertiary }]}>{maxVal.toFixed(0)}</Text>
          <Text style={[styles.axisLabel, { color: theme.colors.textTertiary }]}>{(maxVal / 2).toFixed(0)}</Text>
          <Text style={[styles.axisLabel, { color: theme.colors.textTertiary }]}>0</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, i) => {
            const barHeight = (item.value / maxVal) * (height - 24);
            const color = item.color ?? theme.colors.primary;
            return (
              <View key={i} style={styles.barCol}>
                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {item.value > 0 && (
                    <Text style={[styles.barValue, { color: theme.colors.textSecondary }]}>
                      {item.value % 1 === 0 ? item.value : item.value.toFixed(1)}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(barHeight, 2),
                        width: barWidth,
                        backgroundColor: color,
                        borderRadius: barWidth / 4,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[styles.barLabel, { color: theme.colors.textTertiary }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      {unit && (
        <Text style={[styles.unit, { color: theme.colors.textTertiary }]}>{unit}</Text>
      )}
    </View>
  );
}

export interface HBarData {
  label: string;
  value: number;
  color?: string;
}

interface HBarProps {
  data: HBarData[];
  title?: string;
}

export function SimpleHorizontalBarChart({ data, title }: HBarProps) {
  const { theme } = useTheme();

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      )}
      {data.map((item, i) => (
        <View key={i} style={styles.hBarRow}>
          <Text
            style={[styles.hBarLabel, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
          <View style={[styles.hBarTrack, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <View
              style={[
                styles.hBarFill,
                {
                  width: `${(item.value / maxVal) * 100}%`,
                  backgroundColor: item.color ?? theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.hBarValue, { color: theme.colors.textSecondary }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  chartArea: { flexDirection: 'row' },
  yAxis: { width: 28, justifyContent: 'space-between', paddingBottom: 18 },
  axisLabel: { fontSize: 9, textAlign: 'right' },
  barsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { minHeight: 2 },
  barValue: { fontSize: 9, marginBottom: 2 },
  barLabel: { fontSize: 8, marginTop: 4, textAlign: 'center' },
  unit: { fontSize: 10, textAlign: 'center', marginTop: 4 },
  // Horizontal bar styles
  hBarRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 3, gap: 8 },
  hBarLabel: { width: 80, fontSize: 11, fontWeight: '500' },
  hBarTrack: { flex: 1, height: 16, borderRadius: 8, overflow: 'hidden' },
  hBarFill: { height: '100%', borderRadius: 8, minWidth: 4 },
  hBarValue: { width: 24, fontSize: 12, fontWeight: '600', textAlign: 'right' },
});
