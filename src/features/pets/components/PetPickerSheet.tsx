import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import { PetAvatar } from '@shared/components/ui/PetAvatar';
import { getWeightUnit, kgToInput } from '@shared/utils/weight';
import type { Pet } from '@storage/domain/types';

interface Props {
  visible: boolean;
  pets: Pet[];
  activePetId?: string;
  onSelect: (pet: Pet) => void;
  onAddPet: () => void;
  onClose: () => void;
}

/**
 * Bottom-sheet pet picker. Shown from Dashboard hero / MoreMenu pet card
 * tap when the user has more than one pet.
 *
 * Selecting a pet calls onSelect(pet) — which the consumer wires to
 * petStore.setActivePet — and closes the sheet. The "+ Add pet" row
 * navigates to AddPet (consumer handles paywall gating before opening
 * the sheet, so the row here is unconditional).
 */
export function PetPickerSheet({ visible, pets, activePetId, onSelect, onAddPet, onClose }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  // 5.3: respect the user's weight unit in the pet subtitle
  const weightUnit = getWeightUnit();
  const weightUnitLabel = weightUnit === 'kg' ? t('common.kg') : t('common.lb');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('pets.switchPet', { defaultValue: 'Choose pet' })}
          </Text>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {pets.map(pet => {
              const isActive = pet.id === activePetId;
              return (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.row,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primaryLight
                        : theme.colors.surfaceSecondary,
                    },
                  ]}
                  onPress={() => onSelect(pet)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={pet.name}
                >
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: isActive
                          ? theme.colors.primary
                          : theme.colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <PetAvatar
                      photoUri={pet.photoUri}
                      species={pet.species}
                      size={44}
                      faceSize={26}
                      faceColor={isActive ? '#FFFFFF' : theme.colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.name,
                        {
                          color: isActive ? theme.colors.primary : theme.colors.text,
                          fontFamily: theme.fonts.semibold,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {pet.name}
                    </Text>
                    <Text
                      style={[styles.sub, { color: theme.colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {pet.species === 'cat'
                        ? t('pets.cat')
                        : pet.species === 'dog'
                          ? t('pets.dog')
                          : t('pets.pet')}
                      {pet.weightKg
                        ? ` · ${kgToInput(pet.weightKg, weightUnit)} ${weightUnitLabel}`
                        : ''}
                    </Text>
                  </View>
                  {isActive && (
                    <Icon name="checkmark-circle" size={22} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.addRow,
              {
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={onAddPet}
            accessibilityRole="button"
            accessibilityLabel={t('pets.addPet', { defaultValue: 'Add pet' })}
          >
            <Icon name="add-circle-outline" size={22} color={theme.colors.primary} />
            <Text style={[styles.addRowText, { color: theme.colors.primary }]}>
              {t('pets.addPet', { defaultValue: 'Add pet' })}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16 },
  sub: { fontSize: 13, marginTop: 2 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addRowText: { fontSize: 15, fontWeight: '600' },
});
