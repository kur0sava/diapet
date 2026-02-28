import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ProBadge({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm';
  return (
    <LinearGradient
      colors={['#FFB340', '#FF9500']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.badge, isSmall ? styles.sm : styles.md]}
    >
      <Text style={[styles.text, isSmall ? styles.textSm : styles.textMd]}>PRO</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  md: { paddingHorizontal: 10, paddingVertical: 4 },
  text: { color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  textSm: { fontSize: 9 },
  textMd: { fontSize: 12 },
});
