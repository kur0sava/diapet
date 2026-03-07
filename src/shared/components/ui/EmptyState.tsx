import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { Button } from './Button';

interface Props {
  icon?: string;
  iconName?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = '📋', iconName, iconColor, title, subtitle, actionLabel, onAction }: Props) {
  const { theme } = useTheme();
  const color = iconColor ?? theme.colors.primary;

  return (
    <View style={styles.container}>
      {iconName ? (
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
          <Ionicons name={iconName as string} size={32} color={color} />
        </View>
      ) : (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSizes.lg, fontFamily: theme.fonts.bold }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.fontSizes.base, fontFamily: theme.fonts.regular }]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', lineHeight: 22 },
});
