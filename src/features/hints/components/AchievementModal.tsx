import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import { useHintStore } from '../store/hintStore';
import { ACHIEVEMENT_HERO } from '../data/hintsContent';
import i18n from '@shared/i18n';

const GOLD = '#FFD700';
const GOLD_LIGHT = '#FFF3B0';
const GOLD_DARK = '#B8860B';

export function AchievementModal() {
  const { showAchievement, dismissAchievement } = useHintStore();
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (!showAchievement) return null;

  const lang = i18n.language?.startsWith('en') ? 'en' : 'ru';

  const styles = makeStyles(theme.colors.card, theme.colors.text, theme.colors.textSecondary, theme.isDark);

  return (
    <Modal
      visible={showAchievement}
      transparent
      animationType="fade"
      onRequestClose={dismissAchievement}
    >
      {/* Semi-transparent backdrop */}
      <View style={styles.overlay}>
        {/* Achievement card */}
        <View style={styles.card}>
          {/* Gold star decoration */}
          <View style={styles.iconWrapper}>
            <Ionicons name="star" size={48} color={GOLD} />
          </View>

          {/* Achievement label */}
          <Text style={styles.achievementLabel}>{t('hints.achievementTitle')}</Text>

          {/* Title from content */}
          <Text style={styles.title}>{ACHIEVEMENT_HERO.title[lang]}</Text>

          {/* Congratulation text */}
          {ACHIEVEMENT_HERO.congratulation[lang] ? (
            <Text style={styles.congratulation}>
              {ACHIEVEMENT_HERO.congratulation[lang]}
            </Text>
          ) : null}

          {/* Card text */}
          {ACHIEVEMENT_HERO.cardText[lang] ? (
            <View style={styles.cardTextWrapper}>
              <Text style={styles.cardText}>{ACHIEVEMENT_HERO.cardText[lang]}</Text>
            </View>
          ) : null}

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={dismissAchievement}
            activeOpacity={0.85}
          >
            <Text style={styles.closeButtonText}>{t('hints.achievementClose')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(
  cardBg: string,
  textColor: string,
  textSecondary: string,
  isDark: boolean,
) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    card: {
      width: '100%',
      backgroundColor: cardBg,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      // Gold border accent
      borderWidth: 2,
      borderColor: isDark ? GOLD_DARK : GOLD,
      // Shadow (iOS)
      shadowColor: GOLD,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      // Elevation (Android)
      elevation: 12,
    },
    iconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255,215,0,0.15)' : GOLD_LIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    achievementLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: isDark ? GOLD_DARK : GOLD_DARK,
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: textColor,
      textAlign: 'center',
      marginBottom: 12,
    },
    congratulation: {
      fontSize: 15,
      lineHeight: 22,
      color: textSecondary,
      textAlign: 'center',
      marginBottom: 12,
    },
    cardTextWrapper: {
      backgroundColor: isDark ? 'rgba(255,215,0,0.1)' : GOLD_LIGHT,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      width: '100%',
    },
    cardText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? GOLD_LIGHT : GOLD_DARK,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    closeButton: {
      backgroundColor: GOLD,
      paddingHorizontal: 36,
      paddingVertical: 12,
      borderRadius: 24,
      marginTop: 4,
    },
    closeButtonText: {
      color: '#1A1A1A',
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
