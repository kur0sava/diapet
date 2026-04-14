import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { Icon } from '@shared/components/ui/Icon';
import { useHomeNavigation } from '@navigation/hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { feedingRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { MAX_FEEDING_GRAMS } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { useHintTrigger } from '@features/hints/hooks/useHintTrigger';
import { calculateDryMatter } from '@features/feedCalculator/utils/calculateDryMatter';
import FoodSelector, { SelectedFoodData } from '../components/FoodSelector';

export default function LogFeedingScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogFeeding'>>();
  const { t } = useTranslation();

  const FOOD_TYPE_OPTIONS = useMemo(
    () => [
      { value: 'dry', label: t('feeding.dry') },
      { value: 'wet', label: t('feeding.wet') },
      { value: 'medical', label: t('feeding.medical') },
      {
        value: 'natural',
        label: t('feeding.natural', {
          defaultValue: i18n.language === 'ru' ? 'Натуральный' : 'Natural',
        }),
      },
      { value: 'other', label: t('feeding.other') },
    ],
    [t]
  );
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const highCarbsThreshold = getSpeciesConfig(activePet?.species ?? 'cat').nutrition
    .highCarbsThreshold;
  const queryClient = useQueryClient();

  const [foodType, setFoodType] = useState<string>('dry');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [fedAt, setFedAt] = useState(() =>
    route.params?.presetDate ? new Date(route.params.presetDate) : new Date()
  );
  const initialFedAt = useRef(fedAt.getTime());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { triggerAfterAction } = useHintTrigger();
  const savingRef = useRef(false);

  // Food selector state
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [selectedFood, setSelectedFood] = useState<SelectedFoodData | null>(null);

  // Manual nutrition input
  const [showManualNutrition, setShowManualNutrition] = useState(false);
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [ash, setAsh] = useState('');
  const [moisture, setMoisture] = useState('');

  const dateChanged = fedAt.getTime() !== initialFedAt.current;
  const disableGuard = useUnsavedChangesGuard(
    !!amount || !!notes || dateChanged || foodType !== 'dry' || !!selectedFood
  );

  // Calculate DMB from manual inputs
  const manualResult = useMemo(() => {
    const p = parseFloat(protein.replace(',', '.'));
    const f = parseFloat(fat.replace(',', '.'));
    const fi = parseFloat(fiber.replace(',', '.'));
    const a = parseFloat(ash.replace(',', '.'));
    const m = parseFloat(moisture.replace(',', '.'));
    if ([p, f, fi, a, m].some(isNaN)) return null;
    const nutritionThresholds = getSpeciesConfig(activePet?.species ?? 'cat').nutrition;
    return calculateDryMatter(
      { protein: p, fat: f, fiber: fi, ash: a, moisture: m },
      nutritionThresholds
    );
  }, [protein, fat, fiber, ash, moisture, activePet?.species]);

  const handleFoodSelected = useCallback((data: SelectedFoodData) => {
    if (!data.foodBrand && !data.foodProduct) {
      // Manual entry selected
      setSelectedFood(null);
      setShowManualNutrition(true);
    } else {
      setSelectedFood(data);
      setShowManualNutrition(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (savingRef.current) return;
    if (!activePet) {
      Alert.alert(t('common.error'), t('glucose.petNotFound'));
      return;
    }

    if (amount) {
      const parsedAmount = parseFloat(amount.replace(',', '.'));
      if (
        isNaN(parsedAmount) ||
        !isFinite(parsedAmount) ||
        parsedAmount <= 0 ||
        parsedAmount > MAX_FEEDING_GRAMS
      ) {
        Alert.alert(t('common.error'), t('feeding.amountError'));
        return;
      }
    }

    // Build nutrition data
    let nutritionData: Partial<SelectedFoodData> = {};
    if (selectedFood) {
      nutritionData = selectedFood;
    } else if (showManualNutrition && manualResult) {
      nutritionData = {
        foodBrand: '',
        foodProduct: '',
        protein: parseFloat(protein.replace(',', '.')),
        fat: parseFloat(fat.replace(',', '.')),
        fiber: parseFloat(fiber.replace(',', '.')),
        ash: parseFloat(ash.replace(',', '.')),
        moisture: parseFloat(moisture.replace(',', '.')),
        carbsDM: manualResult.carbsDM,
        verdict: manualResult.verdict,
      };
    }

    savingRef.current = true;
    setLoading(true);
    try {
      await feedingRepository.create({
        petId: activePet.id,
        foodType: foodType || undefined,
        amountGrams: amount ? parseFloat(amount.replace(',', '.')) : undefined,
        notes: notes || undefined,
        fedAt: fedAt.toISOString(),
        foodBrand: nutritionData.foodBrand || undefined,
        foodProduct: nutritionData.foodProduct || undefined,
        protein: nutritionData.protein,
        fat: nutritionData.fat,
        fiber: nutritionData.fiber,
        ash: nutritionData.ash,
        moisture: nutritionData.moisture,
        carbsDM: nutritionData.carbsDM,
        verdict: nutritionData.verdict,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.feedings.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
      disableGuard();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerAfterAction('feeding');
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('feeding.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [
    activePet,
    foodType,
    amount,
    notes,
    fedAt,
    queryClient,
    navigation,
    t,
    triggerAfterAction,
    selectedFood,
    showManualNutrition,
    manualResult,
    protein,
    fat,
    fiber,
    ash,
    moisture,
    disableGuard,
  ]);

  const verdictColor = (v?: string) => {
    if (v === 'good') return '#34C759';
    if (v === 'acceptable') return '#FF9500';
    return '#FF3B30';
  };

  const verdictLabel = (v?: string) => {
    if (v === 'good') return i18n.language === 'ru' ? 'Подходит' : 'Good';
    if (v === 'acceptable') return i18n.language === 'ru' ? 'Допустимо' : 'Acceptable';
    return i18n.language === 'ru' ? 'Не подходит' : 'Not suitable';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>
                {'\u2190 '}
                {t('common.back')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('feeding.title')}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient
            colors={[...theme.gradients.success] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3 }}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Food Type */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('feeding.foodType')}
          </Text>
          <View style={styles.chipGrid}>
            {FOOD_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      foodType === opt.value ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: foodType === opt.value ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => {
                  setFoodType(opt.value);
                  setSelectedFood(null);
                  setShowManualNutrition(false);
                }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: foodType === opt.value ? theme.colors.primary : theme.colors.text },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Food Selector Button */}
          <TouchableOpacity
            style={[
              styles.selectFoodBtn,
              { backgroundColor: theme.colors.surfaceSecondary, borderColor: theme.colors.border },
            ]}
            onPress={() => setShowFoodSelector(true)}
          >
            <Icon name="search-outline" size={18} color={theme.colors.primary} />
            <Text style={[styles.selectFoodText, { color: theme.colors.primary }]}>
              {selectedFood?.foodBrand
                ? `${selectedFood.foodBrand}${selectedFood.foodProduct ? ` — ${selectedFood.foodProduct}` : ''}`
                : t('feeding.selectFood', {
                    defaultValue:
                      i18n.language === 'ru' ? 'Выбрать корм из базы' : 'Select food from database',
                  })}
            </Text>
            <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          {/* Nutrition Card from DB */}
          {selectedFood && selectedFood.carbsDM !== undefined && (
            <Card style={styles.nutritionCard}>
              <View style={styles.nutritionHeader}>
                <Text style={[styles.nutritionTitle, { color: theme.colors.text }]}>
                  {i18n.language === 'ru' ? 'Питательная ценность' : 'Nutrition'}
                </Text>
                <View
                  style={[
                    styles.verdictBadge,
                    { backgroundColor: `${verdictColor(selectedFood.verdict)}20` },
                  ]}
                >
                  <Text style={[styles.verdictText, { color: verdictColor(selectedFood.verdict) }]}>
                    {verdictLabel(selectedFood.verdict)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.carbsValue, { color: verdictColor(selectedFood.verdict) }]}>
                {selectedFood.carbsDM?.toFixed(1)}%{' '}
                {i18n.language === 'ru' ? 'углеводов (СВ)' : 'carbs (DM)'}
              </Text>
              {selectedFood.carbsDM !== undefined && selectedFood.carbsDM > highCarbsThreshold && (
                <View style={[styles.warningRow, { backgroundColor: '#FF3B3015' }]}>
                  <Icon name="warning" size={14} color="#FF3B30" />
                  <Text style={[styles.warningText, { color: '#FF3B30' }]}>
                    {t('feeding.carbsWarning', {
                      defaultValue:
                        i18n.language === 'ru'
                          ? 'Высокое содержание углеводов (>15% СВ)'
                          : 'High carbs (>15% DM)',
                    })}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Manual Nutrition Input */}
          {showManualNutrition && (
            <Card style={styles.nutritionCard}>
              <TouchableOpacity
                style={styles.nutritionHeader}
                onPress={() => setShowManualNutrition(!showManualNutrition)}
              >
                <Text style={[styles.nutritionTitle, { color: theme.colors.text }]}>
                  {t('feeding.manualNutrition', {
                    defaultValue: i18n.language === 'ru' ? 'Ввести состав' : 'Enter nutrition',
                  })}
                </Text>
              </TouchableOpacity>
              <View style={styles.macroGrid}>
                {[
                  {
                    label: i18n.language === 'ru' ? 'Белок %' : 'Protein %',
                    value: protein,
                    setter: setProtein,
                  },
                  { label: i18n.language === 'ru' ? 'Жир %' : 'Fat %', value: fat, setter: setFat },
                  {
                    label: i18n.language === 'ru' ? 'Клетчатка %' : 'Fiber %',
                    value: fiber,
                    setter: setFiber,
                  },
                  {
                    label: i18n.language === 'ru' ? 'Зола %' : 'Ash %',
                    value: ash,
                    setter: setAsh,
                  },
                  {
                    label: i18n.language === 'ru' ? 'Влага %' : 'Moisture %',
                    value: moisture,
                    setter: setMoisture,
                  },
                ].map(field => (
                  <View key={field.label} style={styles.macroField}>
                    <Text style={[styles.macroLabel, { color: theme.colors.textSecondary }]}>
                      {field.label}
                    </Text>
                    <Input
                      value={field.value}
                      onChangeText={field.setter}
                      placeholder="0"
                      keyboardType="decimal-pad"
                      containerStyle={{ width: '100%' }}
                      style={{ fontSize: 16, textAlign: 'center', minHeight: 40 }}
                    />
                  </View>
                ))}
              </View>
              {manualResult && (
                <View style={[styles.resultRow, { borderTopColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.verdictBadge,
                      { backgroundColor: `${verdictColor(manualResult.verdict)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.verdictText, { color: verdictColor(manualResult.verdict) }]}
                    >
                      {verdictLabel(manualResult.verdict)}
                    </Text>
                  </View>
                  <Text style={[styles.carbsValue, { color: verdictColor(manualResult.verdict) }]}>
                    {manualResult.carbsDM.toFixed(1)}%{' '}
                    {i18n.language === 'ru' ? 'угл. СВ' : 'carbs DM'}
                  </Text>
                </View>
              )}
              {manualResult && manualResult.carbsDM > highCarbsThreshold && (
                <View style={[styles.warningRow, { backgroundColor: '#FF3B3015' }]}>
                  <Icon name="warning" size={14} color="#FF3B30" />
                  <Text style={[styles.warningText, { color: '#FF3B30' }]}>
                    {t('feeding.carbsWarning', {
                      defaultValue:
                        i18n.language === 'ru'
                          ? 'Высокое содержание углеводов (>15% СВ)'
                          : 'High carbs (>15% DM)',
                    })}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Toggle manual nutrition if no food selected */}
          {!selectedFood && !showManualNutrition && (
            <TouchableOpacity
              style={[styles.toggleManualBtn]}
              onPress={() => setShowManualNutrition(true)}
            >
              <Icon name="calculator-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.toggleManualText, { color: theme.colors.textSecondary }]}>
                {t('feeding.manualNutrition', {
                  defaultValue:
                    i18n.language === 'ru' ? 'Ввести состав вручную' : 'Enter nutrition manually',
                })}
              </Text>
            </TouchableOpacity>
          )}

          {/* Amount */}
          <Card style={styles.amountCard}>
            <Text style={[styles.amountLabel, { color: theme.colors.textSecondary }]}>
              {t('feeding.amountGrams')}
            </Text>
            <Input
              value={amount}
              onChangeText={setAmount}
              placeholder="50"
              keyboardType="decimal-pad"
              containerStyle={{ width: '100%' }}
              style={{ fontSize: 28, textAlign: 'center', fontWeight: '700', minHeight: 48 }}
            />
            <Text style={[styles.optionalHint, { color: theme.colors.textTertiary }]}>
              {t('feeding.optional')}
            </Text>
          </Card>

          {/* Date & Time */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('glucose.date')} & {t('glucose.time')}
          </Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Icon
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>
                  {format(fedAt, i18n.language === 'ru' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Icon
                  name="time-outline"
                  size={18}
                  color={theme.colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>
                  {format(fedAt, 'HH:mm')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={fedAt}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) {
                  const merged = new Date(date);
                  merged.setHours(fedAt.getHours(), fedAt.getMinutes(), fedAt.getSeconds());
                  setFedAt(merged);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={fedAt}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  const merged = new Date(fedAt);
                  merged.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                  setFedAt(merged);
                }
              }}
            />
          )}

          {/* Notes */}
          <Input
            label={t('glucose.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('feeding.notesPlaceholder')}
            multiline
            numberOfLines={3}
            style={{ height: 80, paddingTop: 12 }}
          />

          <Button
            title={loading ? t('common.loading') : t('common.save')}
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </ScrollView>

        <FoodSelector
          visible={showFoodSelector}
          onClose={() => setShowFoodSelector(false)}
          onSelect={handleFoodSelected}
          filterCategory={foodType === 'natural' ? 'natural' : undefined}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    gap: 8,
  },
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  selectFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectFoodText: { flex: 1, fontSize: 14, fontWeight: '600' },
  nutritionCard: { paddingVertical: 16 },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionTitle: { fontSize: 15, fontWeight: '700' },
  verdictBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  verdictText: { fontSize: 12, fontWeight: '700' },
  carbsValue: { fontSize: 18, fontWeight: '700' },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: { fontSize: 12, fontWeight: '600', flex: 1 },
  toggleManualBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  toggleManualText: { fontSize: 13, fontWeight: '500' },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  macroField: { width: '30%', minWidth: 90 },
  macroLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 0.5,
  },
  amountCard: { alignItems: 'center', paddingVertical: 24 },
  amountLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  optionalHint: { fontSize: 12, marginTop: 4 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateTimeBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
});
