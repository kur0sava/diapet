import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@shared/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  iconName: keyof typeof Ionicons.glyphMap;

  label: string;
  color: string;
  onPress: () => void;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export function QuickActionButton({ iconName, label, color, onPress }: Props) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientColors = [color, lightenColor(color, 40)] as [string, string];

  return (
    <AnimatedPressable
      style={[styles.btn, { backgroundColor: theme.colors.surface, ...theme.shadows.md, borderRadius: 20 }, animatedStyle]}
      // eslint-disable-next-line react-hooks/immutability
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
      // eslint-disable-next-line react-hooks/immutability
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Ionicons name={iconName} size={26} color="#FFFFFF" />
      </LinearGradient>
      <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]} numberOfLines={2}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: '47%', padding: 18, alignItems: 'center', gap: 12 },
  iconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, textAlign: 'center' },
});
