import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeOut, SlideInDown, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useHintStore } from '../store/hintStore';
import type { HintCategory } from '../store/hintStore';

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface CategoryConfig {
  icon: IoniconName;
  labelKey: string;
  color: string;
}

const CATEGORY_CONFIG: Record<HintCategory, CategoryConfig> = {
  practical: {
    icon: 'bulb-outline',
    labelKey: 'hints.tipLabel',
    color: '#FF9500',
  },
  medical_fact: {
    icon: 'medical-outline',
    labelKey: 'hints.factLabel',
    color: '#4A90D9',
  },
  support: {
    icon: 'heart-outline',
    labelKey: 'hints.supportLabel',
    color: '#FF6B6B',
  },
};

const AUTO_DISMISS_MS = 10_000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HintCard() {
  const { currentHint, dismissHint } = useHintStore();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = useMemo(() => makeStyles(theme.colors.card, theme.colors.text, theme.isDark), [theme.colors.card, theme.colors.text, theme.isDark]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (!currentHint) return;
    const timer = setTimeout(dismissHint, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [currentHint, dismissHint]);

  if (!currentHint) return null;

  const config = CATEGORY_CONFIG[currentHint.category];

  return (
    <Animated.View
      entering={SlideInDown.duration(400).easing(Easing.out(Easing.cubic))}
      exiting={FadeOut.duration(250)}
      style={styles.card}
    >
      {/* Header row: icon + category label */}
      <View style={styles.header}>
        <Ionicons name={config.icon} size={18} color={config.color} />
        <Text style={[styles.categoryLabel, { color: config.color }]}>
          {t(config.labelKey)}
        </Text>
      </View>

      {/* Hint text */}
      <Text style={styles.hintText}>{currentHint.text}</Text>

      {/* Dismiss button */}
      <TouchableOpacity
        onPress={dismissHint}
        style={[styles.gotItButton, { backgroundColor: config.color }]}
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

function makeStyles(
  cardBg: string,
  textColor: string,
  isDark: boolean,
) {
  return StyleSheet.create({
    card: {
      position: 'absolute',
      bottom: 100,
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
