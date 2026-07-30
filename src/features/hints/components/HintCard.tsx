import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeOut, SlideInDown, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useHintStore } from '../store/hintStore';
import type { HintCategory } from '../store/hintStore';
import { navigateToArticle } from '@navigation/navigationRef';

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
  const { currentHint, dismissHint, dismissAllHints } = useHintStore();
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
  const articleId = currentHint.articleId;

  const openArticle = () => {
    // dismissAllHints, not dismissHint: the latter promotes the next queued
    // hint, which then popped up on top of the article the user just opened.
    dismissAllHints();
    if (articleId) navigateToArticle(articleId);
  };

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

      {/* Footer: optional "learn more" link + dismiss button */}
      <View style={styles.footer}>
        {articleId ? (
          <TouchableOpacity
            onPress={openArticle}
            style={styles.learnMore}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Icon name="book-outline" size={15} color={accent} />
            <Text style={[styles.learnMoreText, { color: accent }]}>{t('hints.learnMore')}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={dismissHint}
          style={[styles.gotItButton, { backgroundColor: accent }]}
          activeOpacity={0.8}
        >
          <Text style={styles.gotItText}>{t('hints.gotIt')}</Text>
        </TouchableOpacity>
      </View>
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
      borderRadius: 14,
      paddingHorizontal: 13,
      paddingTop: 10,
      paddingBottom: 10,
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
      marginBottom: 4,
      gap: 5,
    },
    categoryLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    hintText: {
      fontSize: 13.5,
      lineHeight: 19,
      color: textColor,
      marginBottom: 10,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    learnMore: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 6,
      paddingRight: 8,
    },
    learnMoreText: {
      fontSize: 13,
      fontWeight: '600',
    },
    gotItButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 18,
      minHeight: 38,
      justifyContent: 'center' as const,
    },
    gotItText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
