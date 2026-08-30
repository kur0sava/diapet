import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import i18n from '@shared/i18n';

const PET_PHOTO_DIR = `${FileSystem.documentDirectory}pet_photos/`;

/** Copy a picked asset into app-owned storage (picker URIs live in a purgeable cache). */
async function persistAsset(uri: string): Promise<string> {
  await FileSystem.makeDirectoryAsync(PET_PHOTO_DIR, { intermediates: true });
  const dest = `${PET_PHOTO_DIR}${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/**
 * Pick a square pet portrait from the gallery or camera and copy it into
 * app-owned storage. Returns the persistent URI, or null when cancelled,
 * permission denied, or the pick failed (the user is told either way).
 *
 * The gallery path deliberately requests no permission: expo-image-picker opens
 * the system photo picker, which grants access to the chosen item only. Asking
 * for READ_MEDIA_IMAGES / READ_EXTERNAL_STORAGE here would be both useless and a
 * Google Play "Photo and Video Permissions" policy violation.
 */
export async function pickPetPhoto(source: 'gallery' | 'camera'): Promise<string | null> {
  if (source === 'camera') {
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

  try {
    const result =
      source === 'gallery'
        ? await ImagePicker.launchImageLibraryAsync(options)
        : await ImagePicker.launchCameraAsync(options);

    if (result.canceled || !result.assets || result.assets.length === 0) return null;
    return await persistAsset(result.assets[0].uri);
  } catch (e) {
    // Native picker/crop can reject (unreadable asset, cropper failure, OOM).
    // Without this the promise rejected unhandled and the tap looked like a no-op.
    //
    // Below API 29 the native camera path also demands WRITE_EXTERNAL_STORAGE on
    // top of the CAMERA grant checked above, so a denial can still land here —
    // say so plainly instead of blaming a failed load.
    const denied = (e as { code?: string })?.code === 'ERR_USER_REJECTED_PERMISSIONS';
    Alert.alert(
      i18n.t('common.error'),
      denied ? i18n.t('symptoms.noCameraAccess') : i18n.t('symptoms.photoPickFailed')
    );
    return null;
  }
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
