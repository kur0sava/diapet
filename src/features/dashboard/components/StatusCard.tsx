import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { IoniconName } from '@shared/components/ui';

interface Props {
  iconName: IoniconName;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  subtitle?: string;
  index?: number;
}

export function StatusCard({
  iconName,
  iconColor,
  label,
  value,
  unit,
  color,
  subtitle,
  index = 0,
}: Props) {
  const { theme } = useTheme();
  const accentColor = color ?? theme.colors.primary;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).duration(400)}
      accessibilityLabel={`${label}: ${value} ${unit ?? ''}`}
      accessibilityRole="text"
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          flex: 1,
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
          ...theme.shadows.md,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${accentColor}15` }]}>
        <Icon name={iconName} size={22} color={iconColor} />
      </View>
      <Text
        style={[styles.value, { color: accentColor, fontFamily: theme.fonts.bold }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        maxFontSizeMultiplier={1.4}
      >
        {value}
      </Text>
      {unit && (
        <Text style={[styles.unit, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {unit}
        </Text>
      )}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, alignItems: 'center', minHeight: 110, gap: 2 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: { fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums'] },
  unit: { fontSize: 11 },
  label: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  subtitle: { fontSize: 11, textAlign: 'center', marginTop: 1 },
});
