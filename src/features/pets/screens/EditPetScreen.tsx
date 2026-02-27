import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMoreNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { petRepository, scheduleRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@storage/mmkv/storage';

export default function EditPetScreen() {
  const navigation = useMoreNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const refreshActivePet = usePetStore(s => s.refreshActivePet);
  const queryClient = useQueryClient();

  const [name, setName] = useState(activePet?.name ?? '');
  const [weightKg, setWeightKg] = useState(activePet?.weightKg?.toString() ?? '');
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [injectionTimes, setInjectionTimes] = useState<string[]>([]);
  const [feedingTimes, setFeedingTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePet) return;
    let cancelled = false;
    setVetName(storage.getString('vetName') ?? '');
    setVetPhone(storage.getString('vetPhone') ?? '');
    scheduleRepository.getInjectionTimes(activePet.id).then(s => { if (!cancelled) setInjectionTimes(s.map(x => x.timeOfDay)); });
    scheduleRepository.getFeedingTimes(activePet.id).then(s => { if (!cancelled) setFeedingTimes(s.map(x => x.timeOfDay)); });
    return () => { cancelled = true; };
  }, [activePet]);

  const handleSave = async () => {
    if (!activePet || !name.trim()) { Alert.alert(t('pets.enterName')); return; }
    setLoading(true);
    try {
      await petRepository.update(activePet.id, { name: name.trim(), weightKg: weightKg ? parseFloat(weightKg.replace(',', '.')) : undefined, insulinType: insulinType || undefined });
      vetName ? storage.set('vetName', vetName) : storage.delete('vetName');
      vetPhone ? storage.set('vetPhone', vetPhone) : storage.delete('vetPhone');
      // FIX-04: persist schedule changes to DB
      const existingInjections = await scheduleRepository.getInjectionTimes(activePet.id);
      for (const s of existingInjections) await scheduleRepository.deleteInjectionTime(s.id);
      for (const time of injectionTimes) await scheduleRepository.addInjectionTime(activePet.id, time);
      const existingFeedings = await scheduleRepository.getFeedingTimes(activePet.id);
      for (const s of existingFeedings) await scheduleRepository.deleteFeedingTime(s.id);
      for (const time of feedingTimes) await scheduleRepository.addFeedingTime(activePet.id, time);
      await refreshActivePet();
      await queryClient.invalidateQueries({ queryKey: ['pet'] });
      await queryClient.invalidateQueries({ queryKey: ['schedule'] });
      navigation.goBack();
    } catch { Alert.alert(t('pets.saveError')); }
    finally { setLoading(false); }
  };

  const validateTime = (value: string): string => {
    const clean = value.replace(/[^0-9:]/g, '');
    const match = clean.match(/^(\d{1,2}):?(\d{0,2})$/);
    if (!match) return clean.slice(0, 5);
    let h = match[1], m = match[2];
    if (parseInt(h) > 23) h = '23';
    if (m && parseInt(m) > 59) m = '59';
    return m !== undefined && m !== '' ? `${h}:${m}` : `${h}:`;
  };

  const renderTimeList = (type: string, times: string[], setTimes: (t: string[]) => void) => (
    <View style={{ gap: 8 }}>
      {times.map((time, i) => (
        <View key={`time-${i}-${time}`} style={[styles.timeRow, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}>
          <Input value={time} onChangeText={v => { const n = [...times]; n[i] = validateTime(v); setTimes(n); }} placeholder="HH:MM" maxLength={5} containerStyle={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setTimes(times.filter((_, idx) => idx !== i))} style={{ padding: 12 }}>
            <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={[styles.addBtn, { borderColor: theme.colors.primary, borderRadius: 12 }]} onPress={() => setTimes([...times, '12:00'])}>
        <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>+ {type === 'injection' ? t('pets.addInjection') : t('pets.addFeeding')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text></TouchableOpacity>
          <Text style={[{ fontSize: 17, fontFamily: theme.fonts.semibold, color: theme.colors.text }]}>{t('pets.editPet')}</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Input label={t('pets.name')} value={name} onChangeText={setName} placeholder="Барсик" />
          <Input label={`${t('pets.weight')} (${t('common.kg')})`} value={weightKg} onChangeText={setWeightKg} placeholder="4.5" keyboardType="decimal-pad" />
          <Input label={t('pets.insulinType')} value={insulinType} onChangeText={setInsulinType} placeholder="Протафан" />
          <View style={styles.sectionHeader}>
            <Ionicons name="medkit-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('pets.injectionSchedule')}</Text>
          </View>
          {renderTimeList('injection', injectionTimes, setInjectionTimes)}
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={20} color={theme.colors.warning} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('pets.feedingSchedule')}</Text>
          </View>
          {renderTimeList('feeding', feedingTimes, setFeedingTimes)}
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={20} color={theme.colors.success} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('pets.vetContact')}</Text>
          </View>
          <Input label={t('onboarding.vetName')} value={vetName} onChangeText={setVetName} placeholder="Др. Иванова" />
          <Input label={t('onboarding.vetPhone')} value={vetPhone} onChangeText={setVetPhone} placeholder="+7 999 000-00-00" keyboardType="phone-pad" />
          <Button title={t('common.save')} onPress={handleSave} fullWidth size="lg" loading={loading} style={{ marginTop: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { padding: 14, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center' },
});
