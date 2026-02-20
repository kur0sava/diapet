import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
  const { activePet, refreshActivePet } = usePetStore();
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
    setVetName(storage.getString('vetName') ?? '');
    setVetPhone(storage.getString('vetPhone') ?? '');
    scheduleRepository.getInjectionTimes(activePet.id).then(s => setInjectionTimes(s.map(x => x.timeOfDay)));
    scheduleRepository.getFeedingTimes(activePet.id).then(s => setFeedingTimes(s.map(x => x.timeOfDay)));
  }, [activePet]);

  const handleSave = async () => {
    if (!activePet || !name.trim()) { Alert.alert('Введите имя'); return; }
    setLoading(true);
    try {
      await petRepository.update(activePet.id, { name: name.trim(), weightKg: weightKg ? parseFloat(weightKg) : undefined, insulinType: insulinType || undefined });
      if (vetName) storage.set('vetName', vetName);
      if (vetPhone) storage.set('vetPhone', vetPhone);
      // FIX-04: persist schedule changes to DB
      const existingInjections = await scheduleRepository.getInjectionTimes(activePet.id);
      for (const s of existingInjections) await scheduleRepository.deleteInjectionTime(s.id);
      for (const time of injectionTimes) await scheduleRepository.addInjectionTime(activePet.id, time);
      const existingFeedings = await scheduleRepository.getFeedingTimes(activePet.id);
      for (const s of existingFeedings) await scheduleRepository.deleteFeedingTime(s.id);
      for (const time of feedingTimes) await scheduleRepository.addFeedingTime(activePet.id, time);
      await refreshActivePet();
      await queryClient.invalidateQueries({ queryKey: ['pet'] });
      navigation.goBack();
    } catch { Alert.alert('Ошибка сохранения'); }
    finally { setLoading(false); }
  };

  const TimeList = ({ type, times, setTimes }: { type: string; times: string[]; setTimes: (t: string[]) => void }) => (
    <View style={{ gap: 8 }}>
      {times.map((time, i) => (
        <View key={i} style={[styles.timeRow, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}>
          <Input value={time} onChangeText={v => { const n = [...times]; n[i] = v; setTimes(n); }} containerStyle={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setTimes(times.filter((_, idx) => idx !== i))} style={{ padding: 12 }}>
            <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={[styles.addBtn, { borderColor: theme.colors.primary, borderRadius: 12 }]} onPress={() => setTimes([...times, '12:00'])}>
        <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>+ {type === 'injection' ? 'Добавить инъекцию' : 'Добавить кормление'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text></TouchableOpacity>
          <Text style={[{ fontSize: 17, fontWeight: '600', color: theme.colors.text }]}>{t('pets.editPet')}</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Input label={t('pets.name')} value={name} onChangeText={setName} placeholder="Барсик" />
          <Input label={`${t('pets.weight')} (кг)`} value={weightKg} onChangeText={setWeightKg} placeholder="4.5" keyboardType="decimal-pad" />
          <Input label={t('pets.insulinType')} value={insulinType} onChangeText={setInsulinType} placeholder="Протафан" />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>💉 Расписание инъекций</Text>
          <TimeList type="injection" times={injectionTimes} setTimes={setInjectionTimes} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🍽️ Расписание кормлений</Text>
          <TimeList type="feeding" times={feedingTimes} setTimes={setFeedingTimes} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🏥 Ветеринар</Text>
          <Input label="Имя ветеринара" value={vetName} onChangeText={setVetName} placeholder="Др. Иванова" />
          <Input label="Телефон" value={vetPhone} onChangeText={setVetPhone} placeholder="+7 999 000-00-00" keyboardType="phone-pad" />
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: { padding: 14, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center' },
});
