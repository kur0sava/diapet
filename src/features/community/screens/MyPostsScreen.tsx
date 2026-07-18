import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery } from '@tanstack/react-query';
import { Icon, Card, ScreenHeader, EmptyState } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import { formatRelative } from '@shared/utils/dateUtils';
import { getMyThreads, ensureProfile } from '../api/communityApi';
import { useCommunityUser } from '../hooks/useCommunityUser';
import type { Thread } from '../types';

function safeRelative(ts: number): string {
  return Number.isFinite(ts) ? formatRelative(new Date(ts).toISOString()) : '';
}

export default function MyPostsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const { uid, displayName, setDisplayName, species } = useCommunityUser();
  const [name, setName] = useState(displayName);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['community', 'myThreads', uid],
    queryFn: () => getMyThreads(uid),
    enabled: !!uid,
  });

  const onSaveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    // Синхронизируем имя в профиль (best-effort)
    if (uid) void ensureProfile(uid, trimmed, species).catch(() => {});
  };

  const renderItem = ({ item }: { item: Thread }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Thread', { threadId: item.id, roomId: item.roomId, title: item.title })
      }
      activeOpacity={0.8}
    >
      <Card style={styles.threadCard}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.threadTitle,
              { color: theme.colors.text, fontFamily: theme.fonts.semibold },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.threadMeta, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {safeRelative(item.lastMessageAt)} · {item.messageCount}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScreenHeader title={t('community.myPosts')} onBack={() => navigation.goBack()} />
      <FlatList
        data={threads}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Card style={styles.nameCard}>
            <Text style={[styles.nameLabel, { color: theme.colors.textSecondary }]}>
              {t('community.displayNameTitle')}
            </Text>
            <View style={styles.nameRow}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder={t('community.displayNamePlaceholder')}
                placeholderTextColor={theme.colors.textTertiary}
                maxLength={40}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={onSaveName}
                accessibilityRole="button"
              >
                <Text style={{ color: '#fff', fontFamily: theme.fonts.semibold }}>
                  {t('community.saveName')}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 32 }} color={theme.colors.primary} />
          ) : (
            <EmptyState
              iconName="chatbubble-ellipses-outline"
              iconColor={theme.colors.primary}
              title={t('community.myPosts')}
              subtitle={t('community.noMyThreads')}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 40, flexGrow: 1 },
  nameCard: { gap: 8, marginBottom: 6 },
  nameLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nameInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  threadCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  threadTitle: { fontSize: 15 },
  threadMeta: { fontSize: 12, marginTop: 4 },
});
