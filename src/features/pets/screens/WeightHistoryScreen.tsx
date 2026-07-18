import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useMoreNavigation } from '@navigation/hooks';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { weightRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { Card, Input } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import { useSuccessToast } from '@shared/components/ui/SuccessToast';
import {
  getWeightUnit,
  setWeightUnit,
  kgToInput,
  inputToKg,
  convertInput,
  kgToLb,
  type WeightUnit,
} from '@shared/utils/weight';
import { formatShortDate } from '@shared/utils/dateUtils';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { checkAchievements } from '@features/hints/utils/achievementEngine';
import type { WeightEntry } from '@storage/domain/types';

const CHART_HEIGHT = 140;

/** Simple polyline chart of weight entries — weight changes are slow and
 *  monotone enough that day-level aggregation isn't needed. */
function WeightChart({ entries, unit }: { entries: WeightEntry[]; unit: WeightUnit }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(screenWidth - 88, 50);

  if (entries.length < 2) return null;

  const toDisplay = (kg: number) => (unit === 'lb' ? kgToLb(kg) : kg);
  const values = entries.map(e => toDisplay(e.weightKg));
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Flat-line guard: pad the domain so a constant weight renders mid-chart
  // instead of dividing by zero.
  const pad = Math.max((max - min) * 0.15, 0.2);
  const lo = min - pad;
  const hi = max + pad;

  const firstTs = new Date(entries[0].recordedAt).getTime();
  const lastTs = new Date(entries[entries.length - 1].recordedAt).getTime();
  const span = Math.max(lastTs - firstTs, 1);

  const x = (e: WeightEntry) =>
    ((new Date(e.recordedAt).getTime() - firstTs) / span) * (chartWidth - 16) + 8;
  const y = (v: number) => CHART_HEIGHT - 14 - ((v - lo) / (hi - lo)) * (CHART_HEIGHT - 28);

  const path = entries
    .map(
      (e, i) => `${i === 0 ? 'M' : 'L'} ${x(e).toFixed(1)} ${y(toDisplay(e.weightKg)).toFixed(1)}`
    )
    .join(' ');

  return (
    <View>
      <View style={chartStyles.minMaxRow}>
        <Text style={[chartStyles.axisLabel, { color: theme.colors.textTertiary }]}>
          {max.toFixed(1)}
        </Text>
      </View>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Line
          x1={0}
          y1={y(max)}
          x2={chartWidth}
          y2={y(max)}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
        <Line
          x1={0}
          y1={y(min)}
          x2={chartWidth}
          y2={y(min)}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          strokeDasharray="4 4"
        />
        <Path d={path} stroke={theme.colors.primary} strokeWidth={2.5} fill="none" />
        {entries.map(e => (
          <Circle
            key={e.id}
            cx={x(e)}
            cy={y(toDisplay(e.weightKg))}
            r={4}
            fill={theme.colors.primary}
            stroke={theme.colors.card}
            strokeWidth={1.5}
          />
        ))}
      </Svg>
      <View style={chartStyles.datesRow}>
        <Text style={[chartStyles.axisLabel, { color: theme.colors.textTertiary }]}>
          {formatShortDate(entries[0].recordedAt)}
        </Text>
        <Text style={[chartStyles.axisLabel, { color: theme.colors.textTertiary }]}>
          {min.toFixed(1)}–{max.toFixed(1)}
        </Text>
        <Text style={[chartStyles.axisLabel, { color: theme.colors.textTertiary }]}>
          {formatShortDate(entries[entries.length - 1].recordedAt)}
        </Text>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  minMaxRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  axisLabel: { fontSize: 11 },
});

export default function WeightHistoryScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const activePet = usePetStore(s => s.activePet);
  const refreshActivePet = usePetStore(s => s.refreshActivePet);
  const petId = activePet?.id ?? '';

  const [unit, setUnit] = useState<WeightUnit>(() => getWeightUnit());
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const { data: entries = [] } = useQuery({
    queryKey: queryKeys.weight.list(petId),
    queryFn: () => weightRepository.findAllByPetId(petId),
    enabled: !!petId,
  });

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const previous = entries.length > 1 ? entries[entries.length - 2] : null;
  const deltaKg = latest && previous ? latest.weightKg - previous.weightKg : null;

  const listDesc = useMemo(() => [...entries].reverse(), [entries]);

  const toggleUnit = () => {
    const next: WeightUnit = unit === 'kg' ? 'lb' : 'kg';
    setWeightUnit(next);
    setInput(convertInput(input, unit, next));
    setUnit(next);
  };

  const handleAdd = async () => {
    if (!activePet || savingRef.current) return;
    const kg = inputToKg(input, unit);
    const maxKg = getSpeciesConfig(activePet.species).validation.maxWeightKg;
    if (kg == null || !isFinite(kg) || kg <= 0 || kg > maxKg) {
      Alert.alert(t('common.error'), t('pets.invalidWeight'));
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await weightRepository.logWeight(activePet.id, Math.round(kg * 100) / 100);
      setInput('');
      await refreshActivePet();
      await queryClient.invalidateQueries({ queryKey: queryKeys.weight.all });
      useSuccessToast.getState().show(t('common.saved'));
      setTimeout(() => {
        void checkAchievements(activePet.id);
      }, 2000);
    } catch {
      Alert.alert(t('common.error'), t('pets.saveError'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = (entry: WeightEntry) => {
    Alert.alert(t('weight.deleteEntry'), formatShortDate(entry.recordedAt), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await weightRepository.delete(entry.id);
            await refreshActivePet();
            await queryClient.invalidateQueries({ queryKey: queryKeys.weight.all });
          } catch {
            Alert.alert(t('common.error'));
          }
        },
      },
    ]);
  };

  const unitLabel = unit === 'kg' ? t('common.kg') : t('common.lb');
  const displayWeight = (kg: number) => `${kgToInput(kg, unit) || '—'} ${unitLabel}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Icon name="chevron-back" size={22} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.medium }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.semibold },
            ]}
            numberOfLines={1}
          >
            {t('weight.title')}
          </Text>
          <TouchableOpacity
            onPress={toggleUnit}
            style={[styles.unitToggle, { borderColor: theme.colors.primary + '40' }]}
            accessibilityRole="button"
          >
            <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>
              {unit}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Current weight + trend */}
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('weight.current')}
            </Text>
            <View style={styles.currentRow}>
              <Text
                style={[
                  styles.currentValue,
                  { color: theme.colors.text, fontFamily: theme.fonts.bold },
                ]}
              >
                {latest ? displayWeight(latest.weightKg) : '—'}
              </Text>
              {deltaKg !== null && Math.abs(deltaKg) >= 0.05 && (
                <View
                  style={[
                    styles.deltaBadge,
                    {
                      backgroundColor:
                        (deltaKg < 0 ? theme.colors.danger : theme.colors.success) + '18',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: deltaKg < 0 ? theme.colors.danger : theme.colors.success,
                      fontFamily: theme.fonts.semibold,
                      fontSize: 13,
                    }}
                  >
                    {deltaKg > 0 ? '+' : ''}
                    {kgToInput(Math.abs(deltaKg), unit) || '0'} {unitLabel}
                    {deltaKg < 0 ? ' ▼' : ' ▲'}
                  </Text>
                </View>
              )}
            </View>
            {/* Weight loss in a diabetic pet is a red flag worth a vet call */}
            {deltaKg !== null && latest && previous && deltaKg / previous.weightKg < -0.05 && (
              <Text style={[styles.lossHint, { color: theme.colors.danger }]}>
                {t('weight.lossWarning')}
              </Text>
            )}
          </Card>

          {/* Chart */}
          {entries.length >= 2 && (
            <Card style={styles.card}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('weight.chart')}
              </Text>
              <WeightChart entries={entries} unit={unit} />
            </Card>
          )}

          {/* Add new weight */}
          <Card style={styles.card}>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
              ]}
            >
              {t('weight.logNew')}
            </Text>
            <View style={styles.addRow}>
              <Input
                value={input}
                onChangeText={setInput}
                placeholder={unit === 'kg' ? '4.5' : '10'}
                keyboardType="decimal-pad"
                maxLength={6}
                containerStyle={{ flex: 1 }}
              />
              <Text style={[styles.addUnit, { color: theme.colors.textSecondary }]}>
                {unitLabel}
              </Text>
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  { backgroundColor: theme.colors.primary, opacity: saving ? 0.6 : 1 },
                ]}
                onPress={handleAdd}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={t('weight.addEntry')}
              >
                <Icon name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* History list */}
          {listDesc.length > 0 && (
            <Card style={styles.card}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.textSecondary, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('weight.history')}
              </Text>
              {listDesc.map(entry => (
                <View
                  key={entry.id}
                  style={[styles.entryRow, { borderBottomColor: theme.colors.divider }]}
                >
                  <Text style={[styles.entryDate, { color: theme.colors.textSecondary }]}>
                    {formatShortDate(entry.recordedAt)}
                  </Text>
                  <Text
                    style={[
                      styles.entryValue,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {displayWeight(entry.weightKg)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.delete')}
                  >
                    <Icon name="trash-outline" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, minWidth: 44 },
  headerTitle: { fontSize: 17, flex: 1, textAlign: 'center' },
  unitToggle: {
    minWidth: 44,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { gap: 8 },
  cardTitle: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  currentValue: { fontSize: 32, fontVariant: ['tabular-nums'] },
  deltaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  lossHint: { fontSize: 12, lineHeight: 16 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addUnit: { fontSize: 15 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  entryDate: { fontSize: 13, flex: 1 },
  entryValue: { fontSize: 15 },
});
