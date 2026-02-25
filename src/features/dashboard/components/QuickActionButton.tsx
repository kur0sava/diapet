import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function QuickActionButton({ iconName, iconColor, label, color, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: theme.colors.surface, ...theme.shadows.sm, borderRadius: 16 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { width: '47%', padding: 16, alignItems: 'center', gap: 10 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, textAlign: 'center' },
});
