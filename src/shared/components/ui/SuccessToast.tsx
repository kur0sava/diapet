import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { Check } from 'lucide-react-native';
import { useTheme } from '@shared/theme';

interface SuccessToastState {
  message: string | null;
  show: (message: string) => void;
  hide: () => void;
}

/**
 * Y7 (design audit 2026-07-17): saving a record used to be a silent goBack —
 * the app never says "got it, well done". A short checkmark pill after each
 * save is the cheapest positive feedback loop for an anxious owner.
 * Call `useSuccessToast.getState().show(t('common.saved'))` after a save.
 */
export const useSuccessToast = create<SuccessToastState>(set => ({
  message: null,
  show: message => set({ message }),
  hide: () => set({ message: null }),
}));

const VISIBLE_MS = 1600;

export function SuccessToast() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const message = useSuccessToast(s => s.message);
  const hide = useSuccessToast(s => s.hide);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(16).stiffness(220)}
      exiting={FadeOut.duration(200)}
      pointerEvents="none"
      style={[styles.wrap, { bottom: 64 + Math.max(insets.bottom, 8) + 24 }]}
    >
      <View style={[styles.pill, { backgroundColor: theme.colors.surface, ...theme.shadows.md }]}>
        <View style={[styles.check, { backgroundColor: theme.colors.success }]}>
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        </View>
        <Text
          style={[styles.text, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 14, flexShrink: 1 },
});
