import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Card } from '@shared/components/ui';
import { Input } from '@shared/components/ui';
import { calculateDryMatter } from '../utils/calculateDryMatter';

export default function FeedCalculatorScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [ash, setAsh] = useState('');
  const [moisture, setMoisture] = useState('');

  const allFilled = protein !== '' && fat !== '' && fiber !== '' && ash !== '' && moisture !== '';

  const result = useMemo(() => {
    if (!allFilled) return null;
    return calculateDryMatter({
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      ash: parseFloat(ash) || 0,
      moisture: parseFloat(moisture) || 0,
    });
  }, [protein, fat, fiber, ash, moisture, allFilled]);

  const verdictColors = {
    good: theme.colors.success,
    acceptable: theme.colors.warning,
    bad: theme.colors.danger,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>{'← '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('feedCalculator.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

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

        {allFilled && !result && (
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            {t('feedCalculator.invalidInput')}
          </Text>
        )}

        {result && (
          <Card style={styles.resultCard}>
            <View style={styles.carbsRow}>
              <Text style={[styles.carbsDMValue, { color: verdictColors[result.verdict] }]}>
                {result.carbsDM.toFixed(1)}%
              </Text>
              <View style={[styles.verdictBadge, { backgroundColor: verdictColors[result.verdict] }]}>
                <Text style={styles.verdictBadgeText}>
                  {t(`feedCalculator.${result.verdict}`)}
                </Text>
              </View>
            </View>
            <Text style={[styles.carbsLabel, { color: theme.colors.textSecondary }]}>
              {t('feedCalculator.carbsDM')}
            </Text>
            <Text style={[styles.verdictDesc, { color: theme.colors.textSecondary }]}>
              {t(`feedCalculator.${result.verdict}Desc`)}
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
                {t('feedCalculator.proteinDM')}
              </Text>
              <View style={styles.macroValue}>
                <Text style={[styles.macroNumber, { color: theme.colors.text }]}>
                  {result.proteinDM.toFixed(1)}%
                </Text>
                <View style={[styles.indicator, { backgroundColor: result.proteinOk ? theme.colors.success : theme.colors.danger }]}>
                  <Text style={styles.indicatorText}>
                    {t(result.proteinOk ? 'feedCalculator.proteinGood' : 'feedCalculator.proteinLow')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.macroRow}>
              <Text style={[styles.macroLabel, { color: theme.colors.text }]}>
                {t('feedCalculator.fatDM')}
              </Text>
              <View style={styles.macroValue}>
                <Text style={[styles.macroNumber, { color: theme.colors.text }]}>
                  {result.fatDM.toFixed(1)}%
                </Text>
                <View style={[styles.indicator, { backgroundColor: result.fatOk ? theme.colors.success : theme.colors.danger }]}>
                  <Text style={styles.indicatorText}>
                    {t(result.fatOk ? 'feedCalculator.fatNormal' : 'feedCalculator.fatHigh')}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.normsCard}>
          <Text style={[styles.normsTitle, { color: theme.colors.textSecondary }]}>
            {t('feedCalculator.norms')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t('feedCalculator.normsCarbs')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t('feedCalculator.normsProtein')}
          </Text>
          <Text style={[styles.normsText, { color: theme.colors.textTertiary }]}>
            {t('feedCalculator.normsFat')}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
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
  },
  macroLabel: { fontSize: 14, fontWeight: '500' },
  macroValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroNumber: { fontSize: 16, fontWeight: '700' },
  indicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
