import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@shared/components/ui/Icon';
import { useTheme } from '@shared/theme';
import { useHintStore } from '../store/hintStore';
import { getAchievementById } from '../data/achievements';
import i18n from '@shared/i18n';

const GOLD = '#FFD700';
const GOLD_LIGHT = '#FFF3B0';
const GOLD_DARK = '#B8860B';

export function AchievementModal() {
  const currentAchievementId = useHintStore(s => s.currentAchievementId);
  const dismissAchievement = useHintStore(s => s.dismissAchievement);
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      makeStyles(theme.colors.card, theme.colors.text, theme.colors.textSecondary, theme.isDark),
    [theme.colors.card, theme.colors.text, theme.colors.textSecondary, theme.isDark]
  );

  const achievement = currentAchievementId ? getAchievementById(currentAchievementId) : undefined;
  if (!achievement) return null;

  const lang = i18n.language?.startsWith('en') ? 'en' : 'ru';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismissAchievement}>
      {/* Semi-transparent backdrop */}
      <View style={styles.overlay}>
        {/* Achievement card — ScrollView, чтобы кнопку «Закрыть» не обрезало
            при крупном системном шрифте на маленьком экране (360×640). */}
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.cardScroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Gold decoration — icon comes from the achievement definition */}
            <View style={styles.iconWrapper}>
              <Icon name={achievement.icon} size={48} color={GOLD} />
            </View>

            {/* Achievement label */}
            <Text style={styles.achievementLabel}>{t('hints.achievementTitle')}</Text>

            {/* Title from content */}
            <Text style={styles.title}>{achievement.title[lang]}</Text>

            {/* Congratulation text */}
            {achievement.congratulation[lang] ? (
              <Text style={styles.congratulation}>{achievement.congratulation[lang]}</Text>
            ) : null}

            {/* Card text */}
            {achievement.cardText[lang] ? (
              <View style={styles.cardTextWrapper}>
                <Text style={styles.cardText}>{achievement.cardText[lang]}</Text>
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(cardBg: string, textColor: string, textSecondary: string, isDark: boolean) {
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
      maxHeight: '85%',
      backgroundColor: cardBg,
      borderRadius: 24,
      overflow: 'hidden',
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
    cardScroll: {
      padding: 28,
      alignItems: 'center',
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
