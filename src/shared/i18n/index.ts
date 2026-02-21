import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ru } from './locales/ru';
import { en } from './locales/en';
import { storage } from '@storage/mmkv/storage';

// Language is read lazily (inside init callback) so that storage
// has been initialised by the time this runs. The module is still
// imported at the top of App.tsx, but i18next.init is synchronous
// enough that the saved language will be picked up on first render
// as long as initStorage() has completed first.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

/**
 * Re-read the persisted language from storage and apply it.
 * Called after initStorage() completes.
 */
export function restoreLanguage(): void {
  const savedLanguage = storage.getString('language');
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
}

export default i18n;

export const changeLanguage = (lang: 'ru' | 'en') => {
  i18n.changeLanguage(lang);
  storage.set('language', lang);
};
