import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon } from '@shared/components/ui/Icon';
import { Card } from '@shared/components/ui';
import { useMoreNavigation } from '@navigation/hooks';
import { useAuthStore } from '../stores/authStore';
import { backupToCloud, restoreFromCloud, hasCloudBackup } from '../utils/cloudBackup';
import { usePetStore } from '@shared/stores/petStore';
import { useQueryClient } from '@tanstack/react-query';

export default function AccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useMoreNavigation();
  const { user, firebaseUid, loading, signIn, signOut } = useAuthStore();
  const loadPets = usePetStore(s => s.loadPets);
  const queryClient = useQueryClient();

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupDate, setBackupDate] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUid) {
      hasCloudBackup(firebaseUid)
        .then(({ exists, date }) => {
          if (exists && date) setBackupDate(date);
        })
        .catch(() => {});
    }
  }, [firebaseUid]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('common.error');
      Alert.alert(t('auth.signInError'), msg);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.signOutConfirm'), t('auth.signOutWarning'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleBackup = async () => {
    if (!firebaseUid) return;
    setBackupLoading(true);
    try {
      await backupToCloud(firebaseUid);
      const now = new Date().toISOString();
      setBackupDate(now);
      Alert.alert(t('auth.backupSuccess'));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('common.error');
      Alert.alert(t('auth.backupError'), msg);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!firebaseUid) return;
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

  const formatBackupDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

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
          </>
        ) : (
          <View style={styles.signInContainer}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary + '15' }]}>
              <Icon name="person-circle-outline" size={64} color={theme.colors.primary} />
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

            <TouchableOpacity
              style={[
                styles.googleBtn,
                { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
              ]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Icon name="logo-google" size={22} color="#4285F4" />
                  <Text
                    style={[
                      styles.googleBtnText,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                  >
                    {t('auth.signInWithGoogle')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  signInContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  signInTitle: { fontSize: 22 },
  signInDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  googleBtnText: { fontSize: 16 },
});
