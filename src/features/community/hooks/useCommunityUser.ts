import { useCallback } from 'react';
import i18n from '@shared/i18n';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { useAuthStore } from '@features/auth/stores/authStore';
import { usePetStore } from '@shared/stores/petStore';
import type { ContentLang } from '@shared/translation';

/**
 * Личность участника сообщества: залогинен ли, uid (Firebase), отображаемое
 * имя (свой ник → имя Google → «Гость»), язык UI (цель перевода), вид питомца.
 */
export function useCommunityUser() {
  const user = useAuthStore(s => s.user);
  const firebaseUid = useAuthStore(s => s.firebaseUid);
  const activeSpecies = usePetStore(s => s.activePet?.species);

  const loggedIn = !!user && !!firebaseUid;
  const userLang: ContentLang = i18n.language?.startsWith('en') ? 'en' : 'ru';

  const displayName =
    storage.getString(StorageKeys.COMMUNITY_DISPLAY_NAME) ||
    user?.name ||
    (userLang === 'en' ? 'Guest' : 'Гость');

  const setDisplayName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 40);
    if (trimmed) storage.set(StorageKeys.COMMUNITY_DISPLAY_NAME, trimmed);
  }, []);

  return {
    loggedIn,
    uid: firebaseUid ?? '',
    displayName,
    setDisplayName,
    userLang,
    species: activeSpecies,
  };
}
