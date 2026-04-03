import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

/**
 * Shows a confirmation dialog when user tries to navigate away with unsaved changes.
 * @param hasUnsavedChanges - whether the form has unsaved data
 *
 * Returns a disableGuard() function that synchronously clears the ref,
 * so callers can do: disableGuard(); navigation.goBack() without the
 * "unsaved changes" dialog flashing.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const enabledRef = useRef(hasUnsavedChanges);

  useEffect(() => {
    enabledRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!enabledRef.current) return;

      e.preventDefault();
      Alert.alert(
        t('common.unsavedChanges'),
        t('common.unsavedChangesDesc'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.discard'), style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, t]);

  /** Call before navigation.goBack() to prevent the guard from firing */
  const disableGuard = useCallback(() => { enabledRef.current = false; }, []);

  return disableGuard;
}
