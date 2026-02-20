import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSymptomsNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery } from '@tanstack/react-query';
import { symptomRepository } from '@storage/database';
import { SYMPTOM_ICONS } from '../types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { Card } from '@shared/components/ui';

export default function SymptomDetailScreen() {
  const navigation = useSymptomsNavigation();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { data: symptom } = useQuery({
    queryKey: ['symptom', route.params.id],
    queryFn: () => symptomRepository.findById(route.params.id),
  });

  if (!symptom) return null;

  const severityColors = { mild: theme.colors.success, moderate: theme.colors.warning, severe: theme.colors.danger };
  const severityLabels = { mild: t('symptoms.mild'), moderate: t('symptoms.moderate'), severe: t('symptoms.severe') };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Запись о симптомах</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSymptom', { editId: symptom.id })}>
          <Text style={{ color: theme.colors.primary }}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{formatDateTime(symptom.recordedAt)}</Text>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Тяжесть</Text>
          <View style={[styles.severityBadge, { backgroundColor: `${severityColors[symptom.severity]}20` }]}>
            <Text style={[styles.severityText, { color: severityColors[symptom.severity] }]}>
              {severityLabels[symptom.severity]}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Симптомы</Text>
          {symptom.symptomTypes.map(type => (
            <View key={type} style={styles.symptomRow}>
              <Text style={styles.symptomEmoji}>{SYMPTOM_ICONS[type]}</Text>
              <Text style={[styles.symptomText, { color: theme.colors.text }]}>{t(`symptoms.types.${type}`)}</Text>
            </View>
          ))}
        </Card>

        {symptom.notes && (
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Заметки</Text>
            <Text style={[styles.notes, { color: theme.colors.text }]}>{symptom.notes}</Text>
          </Card>
        )}

        {symptom.photoUris.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Фото</Text>
            <View style={styles.photosGrid}>
              {symptom.photoUris.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.photo} />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  title: { fontSize: 17, fontWeight: '600' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  date: { fontSize: 14, textAlign: 'center', marginBottom: 4 },
  card: { gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  severityBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  severityText: { fontWeight: '700', fontSize: 15 },
  symptomRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  symptomEmoji: { fontSize: 22 },
  symptomText: { fontSize: 15 },
  notes: { fontSize: 15, lineHeight: 22 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photo: { width: 100, height: 100, borderRadius: 10 },
});
