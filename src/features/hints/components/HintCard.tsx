import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeOut, SlideInDown, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useHintStore } from '../store/hintStore';
import type { HintCategory } from '../store/hintStore';

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

type IoniconName = string;

interface CategoryConfig {
  icon: IoniconName;
  labelKey: string;
  /** Semantic theme-color key — resolved in-component so hint accents follow
   *  the palette (incl. dark mode) instead of hardcoded hex (Y1). */
  colorKey: 'warning' | 'info' | 'danger';
}

const CATEGORY_CONFIG: Record<HintCategory, CategoryConfig> = {
  practical: {
    icon: 'bulb-outline',
    labelKey: 'hints.tipLabel',
    colorKey: 'warning',
  },
  medical_fact: {
    icon: 'medical-outline',
    labelKey: 'hints.factLabel',
    colorKey: 'info',
  },
  support: {
    icon: 'heart-outline',
    labelKey: 'hints.supportLabel',
    colorKey: 'danger',
  },
};

// Y6 (design audit 2026-07-17): was 10s — 2-3 lines of medical text vanished
// before an owner with their hands full of pet could read them, and hints
// have no history to bring them back. 25s, and any touch on the card cancels
// the timer for good (the user is reading; only «Понятно» closes it then).
const AUTO_DISMISS_MS = 25_000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HintCard() {
  const { currentHint, dismissHint } = useHintStore();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () => makeStyles(theme.colors.card, theme.colors.text, theme.isDark),
    [theme.colors.card, theme.colors.text, theme.isDark]
  );

  // Tab bar in MainNavigator is 64 + max(insets.bottom, 8) tall — keep the card above it
  const bottomOffset = 64 + Math.max(insets.bottom, 8) + 16;

  // Auto-dismiss, unless the user has touched this hint's card
  const [touchedHintId, setTouchedHintId] = useState<string | null>(null);
  const paused = currentHint !== null && touchedHintId === currentHint.id;
  useEffect(() => {
    if (!currentHint || paused) return;
    const timer = setTimeout(dismissHint, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [currentHint, paused, dismissHint]);

  if (!currentHint) return null;

  const config = CATEGORY_CONFIG[currentHint.category];
  const accent = theme.colors[config.colorKey];

  return (
    <Animated.View
      entering={SlideInDown.duration(400).easing(Easing.out(Easing.cubic))}
      exiting={FadeOut.duration(250)}
      style={[styles.card, { bottom: bottomOffset }]}
      onTouchStart={() => setTouchedHintId(currentHint.id)}
    >
      {/* Header row: icon + category label */}
      <View style={styles.header}>
        <Icon name={config.icon} size={18} color={accent} />
        <Text style={[styles.categoryLabel, { color: accent }]}>{t(config.labelKey)}</Text>
      </View>

      {/* Hint text */}
      <Text style={styles.hintText}>{currentHint.text}</Text>

      {/* Dismiss button */}
      <TouchableOpacity
        onPress={dismissHint}
        style={[styles.gotItButton, { backgroundColor: accent }]}
        activeOpacity={0.8}
      >
        <Text style={styles.gotItText}>{t('hints.gotIt')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles factory (avoids re-creating StyleSheet on every render by keeping
// primitive values as parameters — still fast because RN StyleSheet.create
// is called at most once per distinct theme combination)
// ---------------------------------------------------------------------------

function makeStyles(cardBg: string, textColor: string, isDark: boolean) {
  return StyleSheet.create({
    card: {
      position: 'absolute',
      left: 16,
      right: 16,
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 16,
      // Shadow (iOS)
      shadowColor: isDark ? '#000' : '#00000033',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.18,
      shadowRadius: 12,
      // Elevation (Android)
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    categoryLabel: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    hintText: {
      fontSize: 15,
      lineHeight: 22,
      color: textColor,
      marginBottom: 14,
    },
    gotItButton: {
      alignSelf: 'flex-end',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    gotItText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
