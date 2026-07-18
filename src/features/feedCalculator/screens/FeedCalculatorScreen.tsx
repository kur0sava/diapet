import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Card, Input, ScreenHeader } from '@shared/components/ui';
import { calculateDryMatter } from '../utils/calculateDryMatter';
import { usePetStore } from '@shared/stores/petStore';
import { getSpeciesConfig } from '@shared/config/speciesConfig';

export default function FeedCalculatorScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const isDog = activePet?.species === 'dog';
  const nutritionConfig = getSpeciesConfig(activePet?.species ?? 'cat').nutrition;

  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [ash, setAsh] = useState('');
  const [moisture, setMoisture] = useState('');

  // C6 (audit): ash is commonly omitted on labels — requiring it dead-ended the
  // tool. Only the other four are required; ash is estimated when blank.
  const requiredFields: { key: string; value: string }[] = [
    { key: 'protein', value: protein },
    { key: 'fat', value: fat },
    { key: 'fiber', value: fiber },
    { key: 'moisture', value: moisture },
  ];
  const missingFields = requiredFields.filter(f => f.value === '').map(f => f.key);
  const canCompute = missingFields.length === 0;
  const ashProvided = ash !== '';

  const result = useMemo(() => {
    if (!canCompute) return null;
    const p = (v: string) => {
      const n = parseFloat(v.replace(',', '.'));
      return isNaN(n) ? null : n;
    };
    const pv = p(protein);
    const fv = p(fat);
    const fbv = p(fiber);
    const mv = p(moisture);
    if (pv === null || fv === null || fbv === null || mv === null) return null;
    // Estimate ash when the label doesn't list it: wet foods carry little ash
    // (~2%), dry foods more (~6%). A caveat is shown below when estimated.
    const av = ashProvided ? p(ash) : mv >= 60 ? 2 : 6;
    if (av === null || av < 0) return null;
    return calculateDryMatter(
      {
        protein: pv,
        fat: fv,
        fiber: fbv,
        ash: av,
        moisture: mv,
      },
      nutritionConfig,
      activePet?.species === 'dog' ? 'dog' : 'cat'
    );
  }, [
    protein,
    fat,
    fiber,
    ash,
    moisture,
    canCompute,
    ashProvided,
    nutritionConfig,
    activePet?.species,
  ]);

  const verdictColors = {
    good: theme.colors.success,
    acceptable: theme.colors.warning,
    bad: theme.colors.danger,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('feedCalculator.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.inputCard}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label={t('feedCalculator.protein')}
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholder="%"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label={t('feedCalculator.fat')}
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholder="%"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label={t('feedCalculator.fiber')}
                value={fiber}
                onChangeText={setFiber}
                keyboardType="decimal-pad"
                placeholder="%"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label={t('feedCalculator.ash')}
                value={ash}
                onChangeText={setAsh}
                keyboardType="decimal-pad"
                placeholder="%"
              />
            </View>
          </View>
          <Input
            label={t('feedCalculator.moisture')}
            value={moisture}
            onChangeText={setMoisture}
            keyboardType="decimal-pad"
            placeholder="%"
          />
        </Card>

        {/* C6: tell the user exactly which required fields are still missing,
            once they've started entering values. */}
        {!canCompute && requiredFields.some(f => f.value !== '') && (
          <Text style={[styles.errorText, { color: theme.colors.warning }]}>
            {t('feedCalculator.missingFields', {
              fields: missingFields.map(k => t(`feedCalculator.${k}`)).join(', '),
            })}
          </Text>
        )}

        {canCompute && !result && (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            {t('feedCalculator.invalidInput')}
          </Text>
        )}

        {/* C6: ash was estimated (label omitted it) — the carbs figure is approximate. */}
        {result && !ashProvided && (
          <Text style={[styles.errorText, { color: theme.colors.warning }]}>
            {t('feedCalculator.ashEstimated')}
          </Text>
        )}

        {result && ashProvided && (parseFloat(ash.replace(',', '.')) || 0) === 0 && (
          <Text style={[styles.errorText, { color: theme.colors.warning }]}>
            {t('feedCalculator.ashZeroWarning')}
          </Text>
        )}

        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.carbsRow}>
              <Text style={[styles.carbsDMValue, { color: verdictColors[result.verdict] }]}>
                {result.carbsDM.toFixed(1)}%
              </Text>
              <View
                style={[styles.verdictBadge, { backgroundColor: verdictColors[result.verdict] }]}
              >
                <Text style={styles.verdictBadgeText}>{t(`feedCalculator.${result.verdict}`)}</Text>
              </View>
            </View>
            <Text style={[styles.carbsLabel, { color: theme.colors.textSecondary }]}>
              {t('feedCalculator.carbsDryMatter')}
            </Text>
            <Text style={[styles.verdictDesc, { color: theme.colors.textSecondary }]}>
              {t(`feedCalculator.${result.verdict}Desc`)}
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
                {t('feedCalculator.proteinDryMatter')}
              </Text>
              <View style={styles.macroValue}>
                <Text style={[styles.macroNumber, { color: theme.colors.text }]}>
                  {result.proteinDM.toFixed(1)}%
                </Text>
                <View
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: result.proteinOk
                        ? theme.colors.success
                        : theme.colors.danger,
                    },
                  ]}
                >
                  <Text style={styles.indicatorText}>
                    {t(
                      result.proteinOk ? 'feedCalculator.proteinGood' : 'feedCalculator.proteinLow'
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
                {t('feedCalculator.fatDryMatter')}
              </Text>
              <View style={styles.macroValue}>
                <Text style={[styles.macroNumber, { color: theme.colors.text }]}>
                  {result.fatDM.toFixed(1)}%
                </Text>
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: result.fatOk ? theme.colors.success : theme.colors.danger },
                  ]}
                >
                  <Text style={styles.indicatorText}>
                    {t(result.fatOk ? 'feedCalculator.fatNormal' : 'feedCalculator.fatHigh')}
                  </Text>
                </View>
              </View>
            </View>

            {/* UX-M4 (audit): fiber row was previously nested INSIDE the fat
                row — broke layout on large fonts and rendered fiber as a
                child of fat. Now lifted out to its own macroRow sibling. */}
            {result.fiberOk !== undefined && (
              <View style={styles.macroRow}>
                <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
                  {t('feedGuide.fiberDM')}
                </Text>
                <View style={styles.macroValue}>
                  <Text style={[styles.macroNumber, { color: theme.colors.text }]}>
                    {result.fiberDM.toFixed(1)}%
                  </Text>
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: result.fiberOk
                          ? theme.colors.success
                          : theme.colors.warning,
                      },
                    ]}
                  >
                    <Text style={styles.indicatorText}>
                      {t(result.fiberOk ? 'feedCalculator.fiberGood' : 'feedCalculator.fiberLow')}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Card>
        )}

        <Card style={styles.normsCard}>
          <Text style={[styles.normsTitle, { color: theme.colors.textSecondary }]}>
            {t(isDog ? 'feedCalculator.normsDog' : 'feedCalculator.norms')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t(isDog ? 'feedCalculator.normsDogCarbs' : 'feedCalculator.normsCarbs')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t(isDog ? 'feedCalculator.normsDogProtein' : 'feedCalculator.normsProtein')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t(isDog ? 'feedCalculator.normsDogFat' : 'feedCalculator.normsFat')}
          </Text>
          {isDog && (
            <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
              {t('feedCalculator.normsDogFiber')}
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  inputCard: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  errorText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  resultCard: { gap: 12 },
  carbsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carbsDMValue: {
    fontSize: 36,
    fontWeight: '800',
  },
  carbsLabel: { fontSize: 13, fontWeight: '500', marginTop: -4 },
  verdictBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verdictBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  verdictDesc: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  divider: { height: 1, marginVertical: 4 },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  macroLabel: { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  macroValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  macroNumber: { fontSize: 16, fontWeight: '700' },
  indicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 140,
  },
  indicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  normsCard: { gap: 6 },
  normsTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  normsText: { fontSize: 12, lineHeight: 18 },
});
