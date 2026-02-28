import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHomeNavigation } from '@navigation/hooks';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { symptomRepository, glucoseRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { SymptomType, SymptomSeverity, SYMPTOM_ICONS } from '../types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GlucoseReading } from '@storage/domain/types';
import { HomeStackParamList } from '@navigation/types';
import { formatDistanceToNow } from 'date-fns';
import { ru as ruLocale } from 'date-fns/locale';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useUnsavedChangesGuard } from '@shared/hooks/useUnsavedChangesGuard';

const ALL_SYMPTOM_TYPES: SymptomType[] = [
  'hindLimbWeakness', 'weightLoss', 'polyuria', 'polydipsia',
  'lossOfAppetite', 'behavioralChanges', 'lethargy', 'vomiting', 'diarrhea', 'other',
];

const SEVERITY_OPTIONS: { value: SymptomSeverity; color: string; labelKey: string }[] = [
  { value: 'mild', color: '#34C759', labelKey: 'symptoms.mild' },
  { value: 'moderate', color: '#FF9500', labelKey: 'symptoms.moderate' },
  { value: 'severe', color: '#FF3B30', labelKey: 'symptoms.severe' },
];

export default function AddSymptomScreen() {
  const navigation = useHomeNavigation();
  const route = useRoute<RouteProp<HomeStackParamList, 'AddSymptom'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const editId = route.params?.editId;
  // H004: respect glucose unit preference
  const glucoseUnit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';
  const dateFnsLocale = (storage.getString(StorageKeys.LANGUAGE) ?? 'ru') === 'ru' ? ruLocale : undefined;
  const [selectedTypes, setSelectedTypes] = useState<SymptomType[]>([]);
  const [severity, setSeverity] = useState<SymptomSeverity>('mild');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // ARCH005: prevent duplicate symptom save on double-tap
  const savingRef = useRef(false);
  const [selectedGlucoseId, setSelectedGlucoseId] = useState<string | undefined>(
    route.params?.glucoseReadingId
  );
  useUnsavedChangesGuard(selectedTypes.length > 0 || !!notes);

  useEffect(() => {
    if (editId) {
      symptomRepository.findById(editId).then(entry => {
        if (!entry) return;
        setSelectedTypes(entry.symptomTypes);
        setSeverity(entry.severity);
        setNotes(entry.notes ?? '');
        setPhotos(entry.photoUris ?? []);
        setSelectedGlucoseId(entry.glucoseReadingId);
      });
    }
  }, [editId]);

  const { data: recentReadings } = useQuery({
    queryKey: ['recentGlucose', activePet?.id],
    queryFn: async () => {
      if (!activePet) return [];
      const result = await glucoseRepository.findByPetId(activePet.id, 5);
      return result.data;
    },
    enabled: !!activePet,
  });

  const toggleType = useCallback((type: SymptomType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);

  const pickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert(t('symptoms.noGalleryAccess')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.6,
      exif: false,
    });
    if (!result.canceled && result.assets) {
      const validAssets = result.assets.filter(a => !a.fileSize || a.fileSize < 5_000_000);
      const dir = `${FileSystem.documentDirectory}symptom_photos/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const savedUris = await Promise.all(
        validAssets.map(async a => {
          const dest = `${dir}${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
          await FileSystem.copyAsync({ from: a.uri, to: dest });
          return dest;
        })
      );
      setPhotos(prev => [...prev, ...savedUris].slice(0, 10));
    }
  }, [t]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert(t('symptoms.noCameraAccess')); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, exif: false });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const dir = `${FileSystem.documentDirectory}symptom_photos/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const dest = `${dir}${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
      setPhotos(prev => [...prev, dest].slice(0, 10));
    }
  }, [t]);

  const handleSave = useCallback(async () => {
    if (savingRef.current || !activePet) return;
    if (selectedTypes.length === 0) { Alert.alert(t('symptoms.selectAtLeastOne')); return; }
    savingRef.current = true;
    setLoading(true);
    try {
      if (editId) {
        await symptomRepository.update(editId, {
          petId: activePet.id,
          symptomTypes: selectedTypes,
          severity,
          notes: notes || undefined,
          photoUris: photos.length > 0 ? photos : undefined,
          glucoseReadingId: selectedGlucoseId,
        });
      } else {
        await symptomRepository.create({
          petId: activePet.id,
          symptomTypes: selectedTypes,
          severity,
          notes: notes || undefined,
          photoUris: photos.length > 0 ? photos : undefined,
          glucoseReadingId: selectedGlucoseId,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('symptoms.saveError'));
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  }, [activePet, selectedTypes, severity, notes, photos, selectedGlucoseId, queryClient, navigation, t]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.colors.primary }}>{'\u2190 '}{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>{editId ? t('symptoms.editSymptom') : t('symptoms.addSymptom')}</Text>
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
                  <Ionicons name={SYMPTOM_ICONS[type] as any} size={24} color={selected ? theme.colors.primary : theme.colors.textSecondary} />
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
                  {t(opt.labelKey)}
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
              <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>{t('symptoms.camera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoBtn, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}
              onPress={pickPhoto}
            >
              <Ionicons name="images-outline" size={24} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>{t('symptoms.gallery')}</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photosGrid}>
              {photos.map((uri, i) => (
                <View key={uri} style={styles.photoThumbContainer}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                  >
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {recentReadings && recentReadings.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('symptoms.linkGlucose')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                {recentReadings.map((reading: GlucoseReading) => {
                  const isSelected = selectedGlucoseId === reading.id;
                  return (
                    <TouchableOpacity
                      key={reading.id}
                      style={[
                        styles.glucoseCard,
                        {
                          backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.surface,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedGlucoseId(isSelected ? undefined : reading.id);
                      }}
                    >
                      <Text style={[styles.glucoseValue, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>
                        {glucoseUnit === 'mg/dL'
                          ? `${reading.valueMgdl} ${t('common.mg_dl')}`
                          : `${reading.valueMmol.toFixed(1)} ${t('common.mmol_l')}`}
                      </Text>
                      <Text style={[styles.glucoseTime, { color: theme.colors.textSecondary }]}>
                        {formatDistanceToNow(new Date(reading.recordedAt), { addSuffix: true, locale: dateFnsLocale })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Input
            label={t('symptoms.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('symptoms.notesPlaceholder')}
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
  glucoseCard: { padding: 12, borderRadius: 12, borderWidth: 2, marginHorizontal: 4, minWidth: 120, alignItems: 'center' },
  glucoseValue: { fontSize: 16, fontWeight: '700' },
  glucoseTime: { fontSize: 11, marginTop: 4 },
});
