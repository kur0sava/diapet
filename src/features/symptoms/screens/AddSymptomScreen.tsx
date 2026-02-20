import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { symptomRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { SymptomType, SymptomSeverity, SYMPTOM_ICONS } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const ALL_SYMPTOM_TYPES: SymptomType[] = [
  'hindLimbWeakness', 'weightLoss', 'polyuria', 'polydipsia',
  'lossOfAppetite', 'behavioralChanges', 'lethargy', 'vomiting', 'diarrhea', 'other',
];

const SEVERITY_OPTIONS: { value: SymptomSeverity; color: string; label: string }[] = [
  { value: 'mild', color: '#34C759', label: 'Лёгкая' },
  { value: 'moderate', color: '#FF9500', label: 'Умеренная' },
  { value: 'severe', color: '#FF3B30', label: 'Тяжёлая' },
];

export default function AddSymptomScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const [selectedTypes, setSelectedTypes] = useState<SymptomType[]>([]);
  const [severity, setSeverity] = useState<SymptomSeverity>('mild');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleType = (type: SymptomType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Нет доступа к галерее'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.6,
      exif: false,
    });
    if (!result.canceled && result.assets) {
      const validAssets = result.assets.filter(a => !a.fileSize || a.fileSize < 5_000_000);
      setPhotos(prev => [...prev, ...validAssets.map(a => a.uri)].slice(0, 10));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Нет доступа к камере'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, exif: false });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos(prev => [...prev, result.assets[0].uri].slice(0, 10));
    }
  };

  const handleSave = async () => {
    if (!activePet) return;
    if (selectedTypes.length === 0) { Alert.alert('Выберите хотя бы один симптом'); return; }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await symptomRepository.create({
        petId: activePet.id,
        symptomTypes: selectedTypes,
        severity,
        notes: notes || undefined,
        photoUris: photos.length > 0 ? photos : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['symptoms'] });
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
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('symptoms.addSymptom')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('symptoms.selectSymptoms')}</Text>
          <View style={styles.symptomGrid}>
            {ALL_SYMPTOM_TYPES.map(type => {
              const selected = selectedTypes.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.symptomChip,
                    {
                      backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surface,
                      borderColor: selected ? theme.colors.primary : 'transparent',
                      borderWidth: 2,
                      ...theme.shadows.sm,
                    },
                  ]}
                  onPress={() => toggleType(type)}
                >
                  <Text style={styles.symptomEmoji}>{SYMPTOM_ICONS[type]}</Text>
                  <Text style={[styles.symptomLabel, { color: selected ? theme.colors.primary : theme.colors.text }]}
                    numberOfLines={2}>
                    {t(`symptoms.types.${type}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('symptoms.severity')}</Text>
          <View style={styles.severityRow}>
            {SEVERITY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.severityBtn,
                  { backgroundColor: severity === opt.value ? opt.color : theme.colors.surfaceSecondary, flex: 1 },
                ]}
                onPress={() => setSeverity(opt.value)}
              >
                <Text style={{ color: severity === opt.value ? '#fff' : theme.colors.text, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('symptoms.photo')}</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}
              onPress={takePhoto}
            >
              <Text style={{ fontSize: 24 }}>📷</Text>
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>Камера</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}
              onPress={pickPhoto}
            >
              <Text style={{ fontSize: 24 }}>🖼️</Text>
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>Галерея</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photosGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumbContainer}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                  >
                    <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <Input
            label={t('symptoms.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder="Опишите симптомы подробнее..."
            multiline
            numberOfLines={4}
            style={{ height: 100, paddingTop: 12 }}
          />

          <Button title={t('common.save')} onPress={handleSave} fullWidth size="lg" loading={loading} style={{ marginTop: 24 }} />
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
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomChip: { width: '47%', padding: 14, borderRadius: 14, alignItems: 'center', gap: 6 },
  symptomEmoji: { fontSize: 28 },
  symptomLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  severityRow: { flexDirection: 'row', gap: 10 },
  severityBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoBtn: { flex: 1, padding: 16, alignItems: 'center', gap: 6 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoThumbContainer: { position: 'relative' },
  photoThumb: { width: 80, height: 80, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center' },
});
