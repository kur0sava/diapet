/**
 * C25: Smart Insight Card — one-sentence contextual alert from the analyzer.
 * Shown on Dashboard when a smart alert fires.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme, type Theme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import type { SmartAlert } from '../engine/smartAlerts';

interface Props {
  alert: SmartAlert;
  onPress?: () => void;
}

function getPriorityColor(priority: SmartAlert['priority'], theme: Theme): string {
  switch (priority) {
    case 'high': return theme.colors.danger;
    case 'medium': return theme.colors.warning;
    case 'low': return theme.colors.success;
  }
}

function getPriorityIcon(priority: SmartAlert['priority']): string {
  switch (priority) {
    case 'high': return 'alert-circle';
    case 'medium': return 'information-circle';
    case 'low': return 'checkmark-circle';
  }
}

export function SmartInsightCard({ alert, onPress }: Props) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const color = getPriorityColor(alert.priority, theme);
  const isRu = i18n.language === 'ru';
  const title = isRu ? alert.titleRu : alert.titleEn;
  const body = isRu ? alert.bodyRu : alert.bodyEn;

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
        accessibilityLabel={`${title}: ${body}`}
        accessibilityRole="alert"
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: color,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
          <Icon name={getPriorityIcon(alert.priority)} size={20} color={color} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {body}
          </Text>
        </View>
        {onPress && <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 3,
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14 },
  body: { fontSize: 12, lineHeight: 17 },
});
