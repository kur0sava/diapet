import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { storage, StorageKeys } from '@storage/mmkv/storage';

const ENCYCLOPEDIA_ROUTE = 'EncyclopediaTab';
const TAIL = 7;

function markSeen() {
  try {
    storage.set(StorageKeys.ENCYCLOPEDIA_HINT_SEEN, true);
  } catch {
    /* storage not ready — harmless, bubble simply shows again next launch */
  }
}

function readSeen(): boolean {
  try {
    return storage.getBoolean(StorageKeys.ENCYCLOPEDIA_HINT_SEEN) ?? false;
  } catch {
    return false;
  }
}

/**
 * Gentle "browse the encyclopedia" bubble that floats above the Encyclopedia
 * tab until the user first opens that tab (or taps the bubble). Rendered inside
 * a custom tabBar so it can overlay the bar without being clipped. The tab's
 * horizontal position is derived from its live index in the navigation state,
 * so it stays correct when optional tabs (AI/Chat) are hidden.
 *
 * "Seen" lives in MMKV and is read on every render. Focusing the Encyclopedia
 * tab writes the flag (effect = syncing external state); the bubble is already
 * hidden while that tab is focused, and the next tab-bar re-render (on leaving)
 * reads the flag back and keeps it hidden for good — no local setState needed.
 */
export function EncyclopediaTabHint({ state, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [bubbleWidth, setBubbleWidth] = useState(0);
  const [opacity] = useState(() => new Animated.Value(0));
  const [bob] = useState(() => new Animated.Value(0));

  const index = state.routes.findIndex(r => r.name === ENCYCLOPEDIA_ROUTE);
  const focusedName = state.routes[state.index]?.name;
  const hidden = readSeen() || index < 0 || focusedName === ENCYCLOPEDIA_ROUTE;

  // Persist "seen" the moment the user lands on the Encyclopedia tab by any
  // means (external-system sync, no state update here).
  useEffect(() => {
    if (focusedName === ENCYCLOPEDIA_ROUTE) markSeen();
  }, [focusedName]);

  useEffect(() => {
    if (hidden) return;
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -4, duration: 900, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hidden, opacity, bob]);

  if (hidden) return null;

  const total = state.routes.length;
  const screenWidth = Dimensions.get('window').width;
  const centerX = (screenWidth / total) * (index + 0.5);
  const tabBarHeight = 64 + Math.max(insets.bottom, 8);

  const onLayout = (e: LayoutChangeEvent) => setBubbleWidth(e.nativeEvent.layout.width);

  const handlePress = () => {
    markSeen();
    navigation.navigate(ENCYCLOPEDIA_ROUTE);
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.anchor,
        {
          left: centerX,
          bottom: tabBarHeight + 2,
          opacity,
          // Center the bubble on the tab, then apply the gentle bob.
          transform: [{ translateX: -bubbleWidth / 2 }, { translateY: bob }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        onLayout={onLayout}
        accessibilityRole="button"
        accessibilityLabel={t('encyclopedia.tabHint')}
        style={[styles.bubble, { backgroundColor: theme.colors.primary, ...theme.shadows.md }]}
      >
        <Text style={[styles.text, { fontFamily: theme.fonts.medium }]} numberOfLines={1}>
          {t('encyclopedia.tabHint')}
        </Text>
      </TouchableOpacity>
      <View style={[styles.tail, { borderTopColor: theme.colors.primary }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    maxWidth: 240,
  },
  text: {
    color: '#fff',
    fontSize: 11.5,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: TAIL,
    borderRightWidth: TAIL,
    borderTopWidth: TAIL,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});
