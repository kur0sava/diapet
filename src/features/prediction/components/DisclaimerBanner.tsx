/**
 * Non-dismissable medical disclaimer banner.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';

interface Props {
  text: string;
}

export function DisclaimerBanner({ text }: Props) {
  const { theme } = useTheme();

  // Theme-aware amber/warning colors
  const bgColor = theme.isDark ? '#78350F' : '#FEF3C7';
  const borderColor = theme.isDark ? '#D97706' : '#F59E0B';
  const iconColor = theme.isDark ? '#FBBF24' : '#D97706';
  const textColor = theme.isDark ? '#FDE68A' : '#92400E';

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Ionicons name="warning" size={18} color={iconColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  icon: { marginRight: 8, marginTop: 1 },
  text: { flex: 1, fontSize: 12, lineHeight: 17 },
});
