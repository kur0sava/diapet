import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import i18n from '@shared/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHomeNavigation } from '@navigation/hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { differenceInMinutes } from 'date-fns';
import { injectionRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';
import { useHintTrigger } from '@features/hints/hooks/useHintTrigger';

// Insulin list is now i18n-driven, see below

export default function LogInjectionScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'LogInjection'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const [dose, setDose] = useState('');
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [notes, setNotes] = useState('');
  const [administeredAt, setAdministeredAt] = useState(() =>
    route.params?.presetDate ? new Date(route.params.presetDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guardEnabled, setGuardEnabled] = useState(true);
  const { triggerAfterAction } = useHintTrigger();
  const commonInsulinsRaw = t('injection.commonInsulins', { returnObjects: true });
  const commonInsulins = Array.isArray(commonInsulinsRaw) ? commonInsulinsRaw as string[] : [];
  // ARCH005: prevent duplicate injection on double-tap
  const savingRef = useRef(false);
  useUnsavedChangesGuard(guardEnabled && (!!dose || !!notes || insulinType !== (activePet?.insulinType ?? '')));

  const doSaveInjection = useCallback(async () => {
    if (!activePet || savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    try {
      await injectionRepository.create({
        petId: activePet.id,
        insulinType: insulinType.trim(),
        doseUnits: parseFloat(dose.replace(',', '.')),
        notes: notes || undefined,
        administeredAt: administeredAt.toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ['injections'] });
      await queryClient.invalidateQueries({ queryKey: ['diary'] });
      setGuardEnabled(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      triggerAfterAction('injection');
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('injection.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [activePet, dose, insulinType, notes, administeredAt, queryClient, navigation, t, triggerAfterAction]);

  const proceedWithDoseChecks = useCallback((doseNum: number) => {
    // MH-C1: Hard limit 10 IU (ISFM 2021, Rand 2012 — clinical max for cats)
    if (doseNum > 10) {
      Alert.alert(t('glucose.doseAbsoluteLimit'), t('glucose.doseAbsoluteLimitDesc'));
      return;
    }
    if (doseNum > 6) {
      Alert.alert(t('glucose.veryHighDoseWarning'), t('glucose.veryHighDoseWarningDesc', { dose: doseNum }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => doSaveInjection() },
      ]);
      return;
    }
    if (doseNum > 4) {
      Alert.alert(t('glucose.highDoseWarning'), t('glucose.highDoseWarningDesc', { dose: doseNum }), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), onPress: () => doSaveInjection() },
      ]);
      return;
    }
    doSaveInjection();
  }, [t, doSaveInjection]);

  const handleSave = useCallback(async () => {
    if (savingRef.current || !activePet) return;
    if (!dose || parseFloat(dose.replace(',', '.')) <= 0) {
      Alert.alert(t('common.error'), t('injection.doseError'));
      return;
    }
    if (!insulinType.trim()) {
      Alert.alert(t('common.error'), t('injection.typeError'));
      return;
    }
    const doseNum = parseFloat(dose.replace(',', '.'));

    // X.8: Duplicate injection safety — warn if last injection < 6 hours ago
    try {
      const lastInj = await injectionRepository.findLatest(activePet.id);
      if (lastInj) {
        const minutesSince = differenceInMinutes(administeredAt, new Date(lastInj.administeredAt));
        if (minutesSince < 360) { // 6 hours
          const hours = Math.floor(minutesSince / 60);
          const mins = minutesSince % 60;
          Alert.alert(
            t('injection.recentInjectionWarning'),
            t('injection.recentInjectionWarningDesc', { hours, minutes: mins }),
            [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('common.confirm'), style: 'destructive', onPress: () => proceedWithDoseChecks(doseNum) },
            ],
          );
          return;
        }
      }
    } catch { /* if DB query fails, proceed without check */ }

    proceedWithDoseChecks(doseNum);
  }, [activePet, dose, insulinType, t, proceedWithDoseChecks]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.primary }}>{'\u2190 '}{t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('injection.title')}</Text>
            <View style={{ width: 60 }} />
          </View>
          <LinearGradient colors={[...theme.gradients.secondary] as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.mainCard}>
            <Ionicons name="medkit-outline" size={48} color={theme.colors.primary} style={{ marginBottom: 8 }} />
            <Input
              label={t('injection.dose')}
              value={dose}
              onChangeText={setDose}
              placeholder="2.0"
              keyboardType="decimal-pad"
              style={{ fontSize: 28, textAlign: 'center', fontWeight: '700' }}
              rightElement={<Text style={{ fontSize: 18, color: theme.colors.textSecondary, fontWeight: '600' }}>{t('common.units')}</Text>}
            />
          </Card>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('injection.insulinType')}</Text>
          <Input
            value={insulinType}
            onChangeText={setInsulinType}
            placeholder={t('glucose.insulinPlaceholder')}
          />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('injection.quickSelect')}</Text>
          <View style={styles.chips}>
            {commonInsulins.map(ins => (
              <TouchableOpacity
                key={ins}
                style={[
                  styles.chip,
                  {
                    backgroundColor: insulinType === ins ? theme.colors.primary : theme.colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setInsulinType(ins)}
              >
                <Text style={{ color: insulinType === ins ? '#fff' : theme.colors.text, fontSize: 13, fontWeight: '500' }}>
                  {ins}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('glucose.date')} & {t('glucose.time')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontFamily: theme.fonts.semibold }}>
                  {format(administeredAt, i18n.language === 'ru' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeContent}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontFamily: theme.fonts.semibold }}>
                  {format(administeredAt, 'HH:mm')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={administeredAt}
              mode="date"
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) {
                  const merged = new Date(date);
                  merged.setHours(administeredAt.getHours(), administeredAt.getMinutes(), administeredAt.getSeconds());
                  setAdministeredAt(merged);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={administeredAt}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) {
                  const merged = new Date(administeredAt);
                  merged.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                  setAdministeredAt(merged);
                }
              }}
            />
          )}

          <Input
            label={t('glucose.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('injection.notesPlaceholder')}
            multiline
            numberOfLines={2}
          />

          <Button
            title={loading ? t('injection.saving') : t('injection.save')}
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
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  title: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  mainCard: { alignItems: 'center', paddingVertical: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  row: { flexDirection: 'row', gap: 10 },
  dateTimeBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  dateTimeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
