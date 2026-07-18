import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from './Icon';

interface Props {
  /** Centered title (17/semibold). */
  title: string;
  /** Back handler. When omitted, the back affordance is hidden (root screens). */
  onBack?: () => void;
  /** Optional right-aligned slot (edit/export/etc.). Reserves a 60px column
   *  for symmetry so the title stays optically centered even without it. */
  right?: React.ReactNode;
  /** Accessibility label for the back button (defaults to common.back). */
  backLabel?: string;
}

/**
 * Canonical screen header (v2.6 batch 5f) — replaces ~19 hand-rolled navHeaders
 * that drifted in back-button style (arrow-text vs chevron), title weight and
 * right-slot width. Back target is a real 44×44 box; title is 17/semibold and
 * truncates; the right column is fixed-width so the title stays centered.
 */
export function ScreenHeader({ title, onBack, right, backLabel }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={backLabel ?? t('common.back')}
          >
            <Icon name="chevron-back" size={22} color={theme.colors.primary} />
            <Text
              style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium, fontSize: 15 }}
              numberOfLines={1}
            >
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text
        style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.semibold }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const SIDE_WIDTH = 84;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    minHeight: 52,
  },
  side: { width: SIDE_WIDTH, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingRight: 8,
  },
  title: { flex: 1, fontSize: 17, textAlign: 'center' },
});
