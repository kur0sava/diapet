import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

/**
 * Shows a confirmation dialog when user tries to navigate away with unsaved changes.
 * @param hasUnsavedChanges - whether the form has unsaved data
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
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
  }, [hasUnsavedChanges, navigation, t]);
}
