import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from '@shared/i18n';

const PET_PHOTO_DIR = `${FileSystem.documentDirectory}pet_photos/`;

/**
 * Pick a square pet portrait from the gallery or camera and copy it into
 * app-owned storage (picker URIs live in a cache the OS may purge).
 * Returns the persistent URI, or null when cancelled / permission denied.
 */
export async function pickPetPhoto(source: 'gallery' | 'camera'): Promise<string | null> {
  if (source === 'gallery') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(i18n.t('common.error'), i18n.t('symptoms.noGalleryAccess'));
      return null;
    }
  } else {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(i18n.t('common.error'), i18n.t('symptoms.noCameraAccess'));
      return null;
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    exif: false,
  };
  const result =
    source === 'gallery'
      ? await ImagePicker.launchImageLibraryAsync(options)
      : await ImagePicker.launchCameraAsync(options);

  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  await FileSystem.makeDirectoryAsync(PET_PHOTO_DIR, { intermediates: true });
  const dest = `${PET_PHOTO_DIR}${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
  return dest;
}

/** Best-effort cleanup of an app-owned pet photo file (never throws). */
export async function deletePetPhotoFile(uri?: string | null): Promise<void> {
  if (!uri || !uri.startsWith(PET_PHOTO_DIR)) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Orphaned file is harmless; DB no longer references it.
  }
}
