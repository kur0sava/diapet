import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  color?: string;
  subtitle?: string;
}

export function StatusCard({ iconName, iconColor, label, value, unit, color, subtitle }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        flex: 1,
        ...theme.shadows.sm,
      },
    ]}>
      <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />
      <Text style={[styles.value, { color: color ?? theme.colors.text, fontFamily: theme.fonts.bold }]}>{value}</Text>
      {unit && <Text style={[styles.unit, { color: theme.colors.textSecondary }]}>{unit}</Text>}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]} numberOfLines={1}>{label}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]} numberOfLines={1}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, alignItems: 'center', minHeight: 90 },
  icon: { marginBottom: 4 },
  value: { fontSize: 16 },
  unit: { fontSize: 10 },
  label: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  subtitle: { fontSize: 10, textAlign: 'center', marginTop: 2 },
});
