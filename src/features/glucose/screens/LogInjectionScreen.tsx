import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input, Card } from '@shared/components/ui';
import { injectionRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

// Insulin list is now i18n-driven, see below

export default function LogInjectionScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const [dose, setDose] = useState('');
  const [insulinType, setInsulinType] = useState(activePet?.insulinType ?? '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const commonInsulins = t('injection.commonInsulins', { returnObjects: true }) as string[];

  const handleSave = useCallback(async () => {
    if (!activePet) return;
    if (!dose || parseFloat(dose.replace(',', '.')) <= 0) {
      Alert.alert(t('common.error'), t('injection.doseError'));
      return;
    }
    if (!insulinType.trim()) {
      Alert.alert(t('common.error'), t('injection.typeError'));
      return;
    }
    setLoading(true);
    try {
      await injectionRepository.create({
        petId: activePet.id,
        insulinType: insulinType.trim(),
        doseUnits: parseFloat(dose.replace(',', '.')),
        notes: notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['injections'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('injection.saveError'));
    } finally {
      setLoading(false);
    }
  }, [activePet, dose, insulinType, notes, queryClient, navigation, t]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View>
          <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
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
});
