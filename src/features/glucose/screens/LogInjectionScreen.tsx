import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { injectionRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

const COMMON_INSULINS = ['Протафан', 'Лантус', 'Лантус SoloStar', 'Левемир', 'Хумулин N', 'Актрапид'];

export default function LogInjectionScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activePet } = usePetStore();
  const queryClient = useQueryClient();

  const [dose, setDose] = useState('');
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!activePet) return;
    if (!dose || parseFloat(dose) <= 0) {
      Alert.alert('Ошибка', 'Введите дозу инсулина');
      return;
    }
    if (!insulinType.trim()) {
      Alert.alert('Ошибка', 'Укажите тип инсулина');
      return;
    }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await injectionRepository.create({
        petId: activePet.id,
        insulinType: insulinType.trim(),
        doseUnits: parseFloat(dose),
        notes: notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['injection'] });
      navigation.goBack();
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Инъекция инсулина</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.mainCard}>
            <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>💉</Text>
            <Input
              label="Доза (единицы)"
              value={dose}
              onChangeText={setDose}
              placeholder="2.0"
              keyboardType="decimal-pad"
              style={{ fontSize: 28, textAlign: 'center', fontWeight: '700' }}
            />
          </Card>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Тип инсулина</Text>
          <Input
            value={insulinType}
            onChangeText={setInsulinType}
            placeholder="Протафан"
          />

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Быстрый выбор</Text>
          <View style={styles.chips}>
            {COMMON_INSULINS.map(ins => (
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

          <Input
            label="Заметки"
            value={notes}
            onChangeText={setNotes}
            placeholder="Опционально..."
            multiline
            numberOfLines={2}
          />

          <Button
            title={loading ? 'Сохранение...' : '✓ Записать инъекцию'}
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
});
