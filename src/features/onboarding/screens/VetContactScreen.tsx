import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';

export default function VetContactScreen() {
  const navigation = useOnboardingNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'VetContact'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');

  const handleContinue = () => {
    navigation.navigate('Notifications', {
      ...route.params,
      vetName: vetName.trim() || undefined,
      vetPhone: vetPhone.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          <Ionicons name="medical-outline" size={64} color={theme.colors.success} style={{ marginBottom: 16, marginTop: 40 }} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('onboarding.vetContact')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('onboarding.vetContactDesc')}
          </Text>

          <View style={styles.form}>
            <Input
              label={t('onboarding.vetName')}
              value={vetName}
              onChangeText={setVetName}
              placeholder="Др. Иванова"
            />
            <Input
              label={t('onboarding.vetPhone')}
              value={vetPhone}
              onChangeText={setVetPhone}
              placeholder="+7 999 000-00-00"
              keyboardType="phone-pad"
            />
          </View>

          <Button title={t('onboarding.next')} onPress={handleContinue} fullWidth size="lg" style={{ marginTop: 32 }} />
          <Button
            title={t('onboarding.skip')}
            onPress={handleContinue}
            variant="ghost"
            fullWidth
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { paddingHorizontal: 24, paddingTop: 16, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  form: { width: '100%', gap: 16 },
});
