import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useOnboardingNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function PetInfoScreen() {
  const navigation = useOnboardingNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [diabetesType, setDiabetesType] = useState<'type1' | 'type2' | 'unknown'>('unknown');
  const [diagnosisDate, setDiagnosisDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('common.error');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    navigation.navigate('Schedule', {
      petData: {
        name: name.trim(),
        gender,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        birthYear: birthYear ? parseInt(birthYear) : undefined,
        diabetesType,
        diagnosisDate: diagnosisDate?.toISOString().split('T')[0],
      },
    });
  };

  const genderOptions = [
    { value: 'male', label: t('common.male'), icon: '♂️' },
    { value: 'female', label: t('common.female'), icon: '♀️' },
  ];

  const diabetesOptions = [
    { value: 'type1', label: t('onboarding.diabetesType1') },
    { value: 'type2', label: t('onboarding.diabetesType2') },
    { value: 'unknown', label: t('onboarding.diabetesUnknown') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('onboarding.addPet')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('onboarding.addPetSubtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('onboarding.petName') + ' *'}
            value={name}
            onChangeText={setName}
            placeholder="Барсик"
            error={errors.name}
          />

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.petGender')}
            </Text>
            <View style={styles.row}>
              {genderOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: gender === opt.value ? theme.colors.primary : theme.colors.surfaceSecondary,
                      flex: 1,
                    },
                  ]}
                  onPress={() => setGender(opt.value as any)}
                >
                  <Text style={{ color: gender === opt.value ? '#fff' : theme.colors.text, fontWeight: '600' }}>
                    {opt.icon} {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <Input
              label={t('onboarding.petWeight')}
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="4.5"
              keyboardType="decimal-pad"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label={t('onboarding.petAge') + ' (год рожд.)'}
              value={birthYear}
              onChangeText={setBirthYear}
              placeholder="2020"
              keyboardType="number-pad"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.diagnosisDate')}
            </Text>
            <TouchableOpacity
              style={[styles.dateBtn, { backgroundColor: theme.colors.surfaceSecondary, borderRadius: 12 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: diagnosisDate ? theme.colors.text : theme.colors.placeholder, padding: 14 }}>
                {diagnosisDate ? diagnosisDate.toLocaleDateString() : t('onboarding.diagnosisDate')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={diagnosisDate ?? new Date()}
              mode="date"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setDiagnosisDate(date);
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {t('onboarding.diabetesType')}
            </Text>
            {diabetesOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.radioRow,
                  { borderColor: diabetesType === opt.value ? theme.colors.primary : theme.colors.border },
                ]}
                onPress={() => setDiabetesType(opt.value as any)}
              >
                <View style={[
                  styles.radio,
                  { borderColor: diabetesType === opt.value ? theme.colors.primary : theme.colors.border },
                ]}>
                  {diabetesType === opt.value && (
                    <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.radioLabel, { color: theme.colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button title={t('onboarding.next')} onPress={handleContinue} fullWidth size="lg" style={{ margin: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  header: { padding: 24, paddingBottom: 0 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  form: { padding: 24, gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  rowInputs: { flexDirection: 'row', gap: 12 },
  optionBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  dateBtn: { overflow: 'hidden' },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
    marginTop: 6,
  },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15 },
});
