import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  getGlucoseColor,
  getGlucoseLevel,
  getGlucoseColorFromRanges,
  getGlucoseLevelFromRanges,
  MGDL_PER_MMOLL,
} from '@storage/domain/types';
import type { PetSpecies } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { useTranslation } from 'react-i18next';
import { storage, StorageKeys } from '@storage/mmkv/storage';

interface Props {
  valueMmol: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  species?: PetSpecies;
}

export function GlucoseValueBadge({ valueMmol, size = 'md', showLabel = true, species }: Props) {
  const { t } = useTranslation();
  const unit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';

  const displayValue =
    unit === 'mg/dL' ? Math.round(valueMmol * MGDL_PER_MMOLL).toString() : valueMmol.toFixed(1);

  const ranges = species ? getSpeciesConfig(species).glucose.ranges : undefined;
  const color = ranges ? getGlucoseColorFromRanges(valueMmol, ranges) : getGlucoseColor(valueMmol);
  const level = ranges ? getGlucoseLevelFromRanges(valueMmol, ranges) : getGlucoseLevel(valueMmol);

  const levelLabels: Record<string, string> = {
    severe_low: t('glucose.severeLow'),
    low: t('glucose.low'),
    below_target: t('glucose.belowTarget'),
    normal: t('glucose.normal'),
    high: t('glucose.high'),
    very_high: t('glucose.veryHigh'),
  };

  const fontSizes = { sm: 14, md: 20, lg: 32 };
  const unitFontSizes = { sm: 10, md: 12, lg: 14 };

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.value, { color, fontSize: fontSizes[size], fontWeight: '700' }]}>
          {displayValue}
        </Text>
        <Text style={[styles.unit, { color, fontSize: unitFontSizes[size], opacity: 0.8 }]}>
          {unit}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color, fontSize: 12, fontWeight: '600' }]}>
          {levelLabels[level]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
  },
  value: {},
  unit: {},
  label: { marginTop: 4 },
});
