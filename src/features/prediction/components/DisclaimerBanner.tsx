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

  return (
    <View style={[styles.container, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
      <Ionicons name="warning" size={18} color="#D97706" style={styles.icon} />
      <Text style={[styles.text, { color: '#92400E' }]}>{text}</Text>
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
