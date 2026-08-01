import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import { Card } from '@shared/components/ui';
import { useMoreNavigation } from '@navigation/hooks';
import { useAuthStore } from '../stores/authStore';
import { REAUTH_REQUIRED } from '../utils/firebaseConfig';
import { backupToCloud, restoreFromCloud, hasCloudBackup } from '../utils/cloudBackup';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';
import { formatFullDateTime } from '@shared/utils/dateUtils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Map a Firebase Auth error to a localized message. */
function mapAuthError(error: unknown, t: TFunction): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/invalid-email':
      return t('auth.errEmailInvalid');
    case 'auth/email-already-in-use':
      return t('auth.errEmailInUse');
    case 'auth/weak-password':
      return t('auth.errWeakPassword');
    // invalid-credential / invalid-login-credentials are what Firebase returns
    // instead of wrong-password/user-not-found when email enumeration
    // protection is on — unmapped, the user got the raw English
    // "Firebase: Error (auth/invalid-login-credentials)." string.
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/missing-password':
      return t('auth.errWrongCredentials');
    case 'auth/too-many-requests':
      return t('auth.errTooManyRequests');
    case 'auth/network-request-failed':
      return t('auth.errNetwork');
    case 'auth/user-disabled':
      return t('auth.errUserDisabled');
    // The Email/Password provider is not enabled in the Firebase console. This
    // is exactly what the FIRST real registration returns if the provider was
    // never switched on, so it must not surface as a raw SDK string.
    case 'auth/operation-not-allowed':
      return t('auth.errEmailAuthDisabled');
    default:
      return error instanceof Error ? error.message : t('common.error');
  }
}

export default function AccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useMoreNavigation();
  const {
    user,
    firebaseUid,
    loading,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    deleteAccount,
  } = useAuthStore();
  const loadPets = usePetStore(s => s.loadPets);
  const queryClient = useQueryClient();

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupDate, setBackupDate] = useState<string | null>(null);

  // Email/password form (Google-free path)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Clear FIRST: the date belongs to the previous uid. The branch below only
    // writes when a backup exists, so signing out and into another account
    // (or one with no backup) used to keep showing the previous account's
    // "last backup" date. `cancelled` also prevents a slow response for an old
    // uid from landing after a newer one.
    setBackupDate(null);
    if (!firebaseUid) return;
    let cancelled = false;
    hasCloudBackup(firebaseUid)
      .then(({ exists, date }) => {
        if (!cancelled && exists && date) setBackupDate(date);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [firebaseUid]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('common.error');
      Alert.alert(t('auth.signInError'), msg);
    }
  };

  const handleEmailSubmit = async () => {
    const mail = email.trim();
    if (!mail) {
      setFormError(t('auth.errEmailRequired'));
      return;
    }
    if (!EMAIL_RE.test(mail)) {
      setFormError(t('auth.errEmailInvalid'));
      return;
    }
    if (password.length < 6) {
      setFormError(t('auth.errPasswordTooShort'));
      return;
    }
    setFormError(null);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(mail, password);
      } else {
        await signInWithEmail(mail, password);
      }
      setPassword('');
    } catch (error: unknown) {
      setFormError(mapAuthError(error, t));
    }
  };

  const handleForgotPassword = async () => {
    const mail = email.trim();
    if (!mail || !EMAIL_RE.test(mail)) {
      setFormError(t('auth.errEmailInvalid'));
      return;
    }
    setFormError(null);
    try {
      await resetPassword(mail);
      Alert.alert(t('auth.resetEmailSent'));
    } catch (error: unknown) {
      Alert.alert(t('auth.signInError'), mapAuthError(error, t));
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.signOutConfirm'), t('auth.signOutWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        // catch: a network error inside Google/Firebase sign-out otherwise
        // surfaces as an unhandled promise rejection
        onPress: () => signOut().catch(() => {}),
      },
    ]);
  };

  // Google Play requires an in-app path to delete an account the app let the
  // user create. Two-step confirmation: this is irreversible and wipes the only
  // off-device copy of the pet's medical history.
  const handleDeleteAccount = () => {
    Alert.alert(t('auth.deleteAccountConfirm'), t('auth.deleteAccountWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(t('auth.deleteAccountFinalTitle'), t('auth.deleteAccountFinalBody'), [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('auth.deleteAccount'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteAccount();
                  Alert.alert(t('auth.deleteAccountDone'), t('auth.deleteAccountDoneBody'));
                } catch (error: unknown) {
                  const msg =
                    error instanceof Error && error.message === REAUTH_REQUIRED
                      ? t('auth.deleteAccountReauth')
                      : mapAuthError(error, t);
                  Alert.alert(t('auth.deleteAccountError'), msg);
                }
              },
            },
          ]);
        },
      },
    ]);
  };

  // user can be restored from MMKV cache while the silent sign-in (and thus
  // firebaseUid) failed — e.g. offline. Without this the backup/restore
  // buttons silently did nothing.
  const requireSession = (): boolean => {
    if (firebaseUid) return true;
    Alert.alert(t('auth.sessionNotReadyTitle'), t('auth.sessionNotReadyBody'));
    return false;
  };

  const handleBackup = async () => {
    if (!requireSession() || !firebaseUid) return;
    setBackupLoading(true);
    try {
      await backupToCloud(firebaseUid);
      const now = new Date().toISOString();
      setBackupDate(now);
      Alert.alert(t('auth.backupSuccess'));
    } catch (error: unknown) {
      const msg =
        error instanceof Error && error.message === 'BACKUP_TOO_LARGE'
          ? t('auth.backupTooLarge')
          : error instanceof Error
            ? error.message
            : t('common.error');
      Alert.alert(t('auth.backupError'), msg);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!requireSession() || !firebaseUid) return;
    Alert.alert(t('auth.restoreConfirm'), t('auth.restoreWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.restore'),
        onPress: async () => {
          setBackupLoading(true);
          try {
            const restored = await restoreFromCloud(firebaseUid);
            if (restored) {
              await loadPets();
              queryClient.clear();
              Alert.alert(t('auth.restoreSuccess'));
            } else {
              Alert.alert(t('auth.noBackupFound'));
            }
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : t('common.error');
            Alert.alert(t('auth.restoreError'), msg);
          } finally {
            setBackupLoading(false);
          }
        },
      },
    ]);
  };

  // BUG-M009 (audit): toLocaleString() honors the device locale, not the
  // app's i18n language. A RU user with EN-locale device saw American date
  // format. Use the app's date helper so the format follows the in-app
  // language switch.
  const formatBackupDate = (iso: string) => formatFullDateTime(iso);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
          {t('auth.account')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {user ? (
          <>
            <Card style={styles.profileCard}>
              <View style={styles.avatarRow}>
                {user.photo ? (
                  <Image source={{ uri: user.photo }} style={styles.avatar} />
                ) : (
                  <View
                    style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={styles.avatarLetter}>
                      {(user.name ?? user.email)?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  {user.name && (
                    <Text
                      style={[
                        styles.userName,
                        { color: theme.colors.text, fontFamily: theme.fonts.bold },
                      ]}
                    >
                      {user.name}
                    </Text>
                  )}
                  <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                    {user.email}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Cloud Backup */}
            <Card style={styles.backupCard}>
              <View style={styles.backupHeader}>
                <Icon name="cloud-outline" size={22} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.backupTitle,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {t('auth.cloudBackup')}
                </Text>
              </View>
              {backupDate && (
                <Text style={[styles.backupDate, { color: theme.colors.textTertiary }]}>
                  {t('auth.lastBackup')}: {formatBackupDate(backupDate)}
                </Text>
              )}
              <View style={styles.backupButtons}>
                <TouchableOpacity
                  style={[styles.backupBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="cloud-upload-outline" size={18} color="#fff" />
                      <Text style={[styles.backupBtnText, { fontFamily: theme.fonts.semibold }]}>
                        {t('auth.backup')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.backupBtn,
                    {
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={handleRestore}
                  disabled={backupLoading}
                >
                  <Icon name="cloud-download-outline" size={18} color={theme.colors.primary} />
                  <Text
                    style={[
                      styles.restoreBtnText,
                      { color: theme.colors.primary, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {t('auth.restore')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <TouchableOpacity
              style={[styles.signOutBtn, { borderColor: theme.colors.danger }]}
              onPress={handleSignOut}
            >
              <Icon name="log-out-outline" size={20} color={theme.colors.danger} />
              <Text
                style={[
                  styles.signOutText,
                  { color: theme.colors.danger, fontFamily: theme.fonts.semibold },
                ]}
              >
                {t('auth.signOut')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount}>
              <Text style={[styles.deleteAccountText, { color: theme.colors.textTertiary }]}>
                {t('auth.deleteAccount')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              contentContainerStyle={styles.signInContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
                <Icon name="person-circle-outline" size={56} color={theme.colors.primary} />
              </View>
              <Text
                style={[
                  styles.signInTitle,
                  { color: theme.colors.text, fontFamily: theme.fonts.bold },
                ]}
              >
                {t('auth.signInTitle')}
              </Text>
              <Text style={[styles.signInDesc, { color: theme.colors.textSecondary }]}>
                {t('auth.signInDescription')}
              </Text>

              {/* Email + password (works without Google services) */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  {t('auth.emailLabel')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={email}
                  onChangeText={v => {
                    setEmail(v);
                    if (formError) setFormError(null);
                  }}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  {t('auth.passwordLabel')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  value={password}
                  onChangeText={v => {
                    setPassword(v);
                    if (formError) setFormError(null);
                  }}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={theme.colors.textTertiary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'password'}
                  editable={!loading}
                  onSubmitEditing={handleEmailSubmit}
                  returnKeyType="done"
                />
              </View>

              {formError && (
                <Text style={[styles.formError, { color: theme.colors.danger }]}>{formError}</Text>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleEmailSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.primaryBtnText, { fontFamily: theme.fonts.semibold }]}>
                    {authMode === 'signup' ? t('auth.register') : t('auth.signInWithEmail')}
                  </Text>
                )}
              </TouchableOpacity>

              {authMode === 'signin' && (
                <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                  <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                    {t('auth.forgotPassword')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  setAuthMode(m => (m === 'signin' ? 'signup' : 'signin'));
                  setFormError(null);
                }}
                disabled={loading}
              >
                <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                  {authMode === 'signin' ? t('auth.noAccountPrompt') : t('auth.haveAccountPrompt')}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerText, { color: theme.colors.textTertiary }]}>
                  {t('auth.orDivider')}
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <TouchableOpacity
                style={[
                  styles.googleBtn,
                  { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
                ]}
                onPress={handleSignIn}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Icon name="logo-google" size={22} color="#4285F4" />
                <Text
                  style={[
                    styles.googleBtnText,
                    { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                  ]}
                >
                  {t('auth.signInWithGoogle')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18 },
  content: { flex: 1, padding: 20, gap: 16 },
  profileCard: { padding: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 24, fontWeight: '700', color: '#fff' },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 18 },
  userEmail: { fontSize: 14 },
  backupCard: { padding: 16, gap: 12 },
  backupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backupTitle: { fontSize: 16 },
  backupDate: { fontSize: 12 },
  backupButtons: { flexDirection: 'row', gap: 10 },
  backupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backupBtnText: { color: '#fff', fontSize: 14 },
  restoreBtnText: { fontSize: 14 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  signOutText: { fontSize: 15 },
  deleteAccountBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 4 },
  deleteAccountText: { fontSize: 13, textDecorationLine: 'underline' },
  signInContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  signInTitle: { fontSize: 22 },
  signInDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  formGroup: { width: '100%', gap: 6 },
  inputLabel: { fontSize: 13 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  formError: { fontSize: 13, textAlign: 'center', width: '100%' },
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16 },
  linkText: { fontSize: 14, textAlign: 'center', paddingVertical: 4 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  googleBtnText: { fontSize: 16 },
});
