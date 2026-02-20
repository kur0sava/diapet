import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@shared/theme';
import * as Haptics from 'expo-haptics';

interface Props {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function QuickActionButton({ icon, label, color, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: theme.colors.surface, ...theme.shadows.sm, borderRadius: 16 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color: theme.colors.text }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: '47%', padding: 16, alignItems: 'center', gap: 10 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
  label: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
