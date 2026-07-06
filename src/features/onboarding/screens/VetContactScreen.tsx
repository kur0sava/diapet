import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useOnboardingNavigation } from '@navigation/hooks';
import type { OnboardingStackParamList } from '@navigation/types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Button, Input } from '@shared/components/ui';
import { Icon } from '@shared/components/ui/Icon';
import { storage, StorageKeys } from '@storage/mmkv/storage';

// UX-C4 (audit): vet contact draft survives app kill mid-onboarding so a
// user who entered name/phone and then got pulled away (call, OOM kill)
// doesn't have to re-type. Keys are namespaced under the unified
// ONBOARDING_DRAFT JSON, populated alongside PetInfoScreen draft.
function readDraft(): { vetName?: string; vetPhone?: string } {
  const raw = storage.getString(StorageKeys.ONBOARDING_DRAFT);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return { vetName: parsed?.vetName, vetPhone: parsed?.vetPhone };
  } catch {
    return {};
  }
}

function mergeDraft(patch: Record<string, unknown>): void {
  const raw = storage.getString(StorageKeys.ONBOARDING_DRAFT);
  let current: Record<string, unknown> = {};
  if (raw) {
    try {
      current = JSON.parse(raw);
    } catch {
      /* corrupt — overwrite */
    }
  }
  storage.set(StorageKeys.ONBOARDING_DRAFT, JSON.stringify({ ...current, ...patch }));
}

export default function VetContactScreen() {
  const navigation = useOnboardingNavigation();
  const route = useRoute<RouteProp<OnboardingStackParamList, 'VetContact'>>();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const draft = readDraft();
  const [vetName, setVetName] = useState(draft.vetName ?? '');
  const [vetPhone, setVetPhone] = useState(draft.vetPhone ?? '');

  const handleContinue = () => {
    const trimmedName = vetName.trim();
    const trimmedPhone = vetPhone.trim();
    mergeDraft({
      vetName: trimmedName || undefined,
      vetPhone: trimmedPhone || undefined,
    });
    navigation.navigate('Notifications', {
      ...route.params,
      vetName: trimmedName || undefined,
      vetPhone: trimmedPhone || undefined,
    });
  };

  // UX-M2 (audit): "Skip" must clear, not preserve. Otherwise a user who
  // typed something, changed their mind, and tapped Skip would still have
  // their data flow downstream — making "Skip" feel broken.
  const handleSkip = () => {
    mergeDraft({ vetName: undefined, vetPhone: undefined });
    navigation.navigate('Notifications', {
      ...route.params,
      vetName: undefined,
      vetPhone: undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <View style={styles.content}>
            <Icon
              name="medical-outline"
              size={64}
              color={theme.colors.success}
              style={{ marginBottom: 16, marginTop: 40 }}
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('onboarding.vetContact')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.vetContactDesc')}
            </Text>

            <View style={styles.form}>
              <Input
                label={t('onboarding.vetName')}
                value={vetName}
                onChangeText={setVetName}
                placeholder={t('onboarding.vetNamePlaceholder')}
              />
              <Input
                label={t('onboarding.vetPhone')}
                value={vetPhone}
                onChangeText={setVetPhone}
                placeholder={t('onboarding.vetPhonePlaceholder')}
                keyboardType="phone-pad"
              />
            </View>

            <Button
              title={t('onboarding.next')}
              onPress={handleContinue}
              fullWidth
              size="lg"
              style={{ marginTop: 32 }}
            />
            <Button
              title={t('onboarding.skip')}
              onPress={handleSkip}
              variant="ghost"
              fullWidth
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  form: { width: '100%', gap: 16 },
});
