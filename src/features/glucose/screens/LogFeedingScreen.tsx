import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useHomeNavigation } from '@navigation/hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { feedingRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { useHintTrigger } from '@features/hints/hooks/useHintTrigger';

export default function LogFeedingScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogFeeding'>>();
  const { t } = useTranslation();

  const FOOD_TYPE_OPTIONS = useMemo(() => [
    { value: 'dry', label: t('feeding.dry') },
    { value: 'wet', label: t('feeding.wet') },
    { value: 'medical', label: t('feeding.medical') },
    { value: 'other', label: t('feeding.other') },
  ], [t]);
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const [foodType, setFoodType] = useState<string>('dry');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [fedAt, setFedAt] = useState(() =>
    route.params?.presetDate ? new Date(route.params.presetDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { triggerAfterAction } = useHintTrigger();
  // ARCH005: prevent duplicate feeding on double-tap
  const savingRef = useRef(false);
  const disableGuard = useUnsavedChangesGuard(!!amount || !!notes || foodType !== 'dry');

  const handleSave = useCallback(async () => {
    if (savingRef.current) return; // silent guard against double-tap
    if (!activePet) {
      Alert.alert(t('common.error'), t('glucose.petNotFound'));
      return;
    }

    // Validate amount: if provided, must be a positive number
    if (amount) {
      const parsedAmount = parseFloat(amount.replace(',', '.'));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert(t('common.error'), t('feeding.amountError'));
        return;
      }
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
      });
      await queryClient.invalidateQueries({ queryKey: ['feedings'] });
      await queryClient.invalidateQueries({ queryKey: ['diary'] });
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
  }, [activePet, foodType, amount, notes, fedAt, queryClient, navigation, t, triggerAfterAction]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'\u2190 '}{t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('feeding.title')}
            </Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient colors={[...theme.gradients.success] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Food Type */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('feeding.foodType')}</Text>
          <View style={styles.chipGrid}>
            {FOOD_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: foodType === opt.value ? theme.colors.primaryLight : theme.colors.surface,
                    borderColor: foodType === opt.value ? theme.colors.primary : 'transparent',
                    borderWidth: 2,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => setFoodType(opt.value)}
              >
                <Text style={[
                  styles.chipLabel,
                  { color: foodType === opt.value ? theme.colors.primary : theme.colors.text },
                ]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('glucose.date')} & {t('glucose.time')}</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
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
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 8,
  },
  backBtn: { width: 60, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  chipLabel: { fontSize: 14, fontWeight: '600' },
  amountCard: { alignItems: 'center', paddingVertical: 24 },
  amountLabel: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  optionalHint: { fontSize: 12, marginTop: 4 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },
  dateTimeBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  dateTimeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14 },
});
