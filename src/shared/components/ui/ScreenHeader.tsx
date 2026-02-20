import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, showBack = true, rightAction }: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      {rightAction ?? <View style={styles.backBtn} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: { width: 60 },
  title: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
});
