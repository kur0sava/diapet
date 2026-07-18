import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { Icon, Card } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import { getVisibleRooms } from '../data/rooms';
import { useCommunityUser } from '../hooks/useCommunityUser';

export default function CommunityRoomsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const { loggedIn, signIn } = useCommunityUser();
  const [showAll, setShowAll] = useState(false);

  if (!loggedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.gate}>
          <Icon name="chatbubble-ellipses-outline" size={56} color={theme.colors.primary} />
          <Text
            style={[styles.gateTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}
          >
            {t('community.loginRequiredTitle')}
          </Text>
          <Text style={[styles.gateBody, { color: theme.colors.textSecondary }]}>
            {t('community.loginRequiredBody')}
          </Text>
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // UX-аудит: молчаливый .catch(()=>{}) скрывал ошибку входа —
              // юзер жал кнопку, ничего не происходило. Показываем ошибку.
              void signIn().catch(() => {
                Alert.alert(t('common.error'), t('auth.sessionNotReadyBody'));
              });
            }}
            accessibilityRole="button"
          >
            <Icon name="logo-google" size={18} color="#fff" />
            <Text style={styles.signInText}>{t('community.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rooms = getVisibleRooms(showAll);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {t('community.title')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MyPosts')}
            style={styles.profileBtn}
            accessibilityRole="button"
            accessibilityLabel={t('community.myPosts')}
          >
            <Icon name="person-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('community.subtitle')}
        </Text>
        <View style={[styles.intlBadge, { backgroundColor: theme.colors.info + '18' }]}>
          <Icon name="globe-outline" size={13} color={theme.colors.info} />
          <Text style={[styles.intlText, { color: theme.colors.info }]}>
            {t('community.international')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {rooms.map(room => (
          <TouchableOpacity
            key={room.id}
            onPress={() => navigation.navigate('ThreadList', { roomId: room.id })}
            activeOpacity={0.8}
          >
            <Card style={styles.roomCard}>
              <View style={[styles.roomIcon, { backgroundColor: theme.colors.primary + '18' }]}>
                <Icon name={room.icon} size={22} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.roomTitleRow}>
                  <Text
                    style={[
                      styles.roomTitle,
                      { color: theme.colors.text, fontFamily: theme.fonts.semibold },
                    ]}
                    numberOfLines={1}
                  >
                    {t(`community.rooms.${room.key}.title`)}
                  </Text>
                  {room.species !== 'all' && (
                    <View
                      style={[
                        styles.speciesBadge,
                        { backgroundColor: theme.colors.surfaceSecondary },
                      ]}
                    >
                      <Text style={[styles.speciesText, { color: theme.colors.textSecondary }]}>
                        {room.species === 'cat'
                          ? t('community.speciesCat')
                          : t('community.speciesDog')}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.roomDesc, { color: theme.colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {t(`community.rooms.${room.key}.desc`)}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Card>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.showAllBtn}
          onPress={() => setShowAll(v => !v)}
          accessibilityRole="button"
        >
          <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>
            {showAll ? t('community.showMvpRooms') : t('community.showAllRooms')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: theme.colors.textTertiary }]}>
          {t('community.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, gap: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileBtn: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14 },
  intlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
  },
  intlText: { fontSize: 12 },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  roomCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomTitle: { fontSize: 16, flexShrink: 1 },
  speciesBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  speciesText: { fontSize: 11, fontWeight: '600' },
  roomDesc: { fontSize: 13, marginTop: 2 },
  showAllBtn: { alignItems: 'center', paddingVertical: 12 },
  disclaimer: { fontSize: 12, textAlign: 'center', lineHeight: 16, marginTop: 4 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  gateTitle: { fontSize: 20, textAlign: 'center' },
  gateBody: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
