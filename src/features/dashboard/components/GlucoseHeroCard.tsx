import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';

interface Props {
  label: string;
  /** Preformatted number in the display unit, or '—' when there are no readings */
  value: string;
  unitLabel: string;
  /** Range colour for the value/badge; pass textTertiary when empty */
  color: string;
  /** Status word («Норма», «Высокая»…); omitted when there are no readings */
  statusLabel?: string;
  /** Danger-direction glyph ▼/▲ from getGlucoseArrow — non-colour channel */
  dangerArrow?: string;
  /** Trend arrow (↗↘→) from the analyzer's calculateTrend */
  trendArrow?: string;
  timeAgo?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * R1 (design audit 2026-07-17): the latest glucose value is THE answer the
 * owner opens the app for, 2-4×/day, often anxious and sometimes without
 * glasses. It used to be an 18px number in a third-of-screen StatusCard —
 * smaller than the pet's name. This card makes it the largest element on the
 * dashboard: 42px tabular digits + a status word, with the danger direction
 * duplicated by a ▼/▲ glyph (colour-blind safe).
 */
export function GlucoseHeroCard({
  label,
  value,
  unitLabel,
  color,
  statusLabel,
  dangerArrow,
  trendArrow,
  timeAgo,
  style,
}: Props) {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value} ${unitLabel}${statusLabel ? `, ${statusLabel}` : ''}`}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          borderLeftWidth: 3,
          borderLeftColor: color,
          ...theme.shadows.md,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelWrap}>
          <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
            <Icon name="water-outline" size={18} color={color} />
          </View>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
        {timeAgo ? (
          <Text style={[styles.time, { color: theme.colors.textTertiary }]} numberOfLines={1}>
            {timeAgo}
          </Text>
        ) : null}
      </View>

      <View style={styles.mainRow}>
        <Text
          style={[styles.value, { color, fontFamily: theme.fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          maxFontSizeMultiplier={1.4}
        >
          {value}
          {trendArrow ? <Text style={styles.trend}>{` ${trendArrow}`}</Text> : null}
        </Text>
        <View style={styles.rightCol}>
          <Text style={[styles.unit, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {unitLabel}
          </Text>
          {statusLabel ? (
            <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
              <Text
                style={[styles.badgeText, { color, fontFamily: theme.fonts.semibold }]}
                numberOfLines={1}
              >
                {dangerArrow ? `${dangerArrow} ` : ''}
                {statusLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, paddingTop: 12 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, flexShrink: 1 },
  time: { fontSize: 11 },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  value: {
    fontSize: 42,
    lineHeight: 48,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  trend: { fontSize: 24 },
  rightCol: { alignItems: 'flex-end', gap: 4, paddingBottom: 4 },
  unit: { fontSize: 12 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 13 },
});
