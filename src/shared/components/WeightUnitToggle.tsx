import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import type { WeightUnit } from '@shared/utils/weight';

/** Compact kg/lb selector for the pet-weight input (audit A3). */
export function WeightUnitToggle({
  unit,
  onChange,
}: {
  unit: WeightUnit;
  onChange: (u: WeightUnit) => void;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <View style={styles.row}>
      {(['kg', 'lb'] as WeightUnit[]).map(u => (
        <TouchableOpacity
          key={u}
          onPress={() => onChange(u)}
          style={[
            styles.btn,
            {
              backgroundColor: unit === u ? theme.colors.primary : theme.colors.surfaceSecondary,
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: unit === u }}
        >
          <Text
            style={{
              color: unit === u ? '#fff' : theme.colors.text,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            {t(`common.${u}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
});
