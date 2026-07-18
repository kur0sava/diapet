import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery } from '@tanstack/react-query';
import { Icon, Card, ScreenHeader, EmptyState } from '@shared/components/ui';
import { useCommunityNavigation } from '@navigation/hooks';
import type { CommunityStackParamList } from '@navigation/types';
import { formatRelative } from '@shared/utils/dateUtils';
import { getRoomById } from '../data/rooms';
import { listThreads } from '../api/communityApi';
import { isBlocked } from '../utils/blocklist';
import type { Thread } from '../types';

/** Audit L3: guard against a corrupt/missing timestamp — new Date(NaN)
 *  .toISOString() throws RangeError and would white-screen the row. */
function safeRelative(ts: number): string {
  return Number.isFinite(ts) ? formatRelative(new Date(ts).toISOString()) : '';
}

export default function ThreadListScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useCommunityNavigation();
  const route = useRoute<RouteProp<CommunityStackParamList, 'ThreadList'>>();
  const { roomId } = route.params;
  const room = getRoomById(roomId);

  const {
    data: threads = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['community', 'threads', roomId],
    // Международный чат — без языкового фильтра (перевод по кнопке в треде)
    queryFn: () => listThreads(roomId),
    enabled: !!roomId,
    retry: 1,
  });

  // Обновляем список при возврате с экрана треда/создания темы
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderItem = ({ item }: { item: Thread }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Thread', { threadId: item.id, roomId, title: item.title })
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
            {item.authorName} · {safeRelative(item.lastMessageAt)} · {item.messageCount}
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
      <ScreenHeader
        title={room ? t(`community.rooms.${room.key}.title`) : t('community.threads')}
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        // Audit H1: без составных индексов / до деплоя правил getDocs бросает.
        // Раньше ошибка глоталась и экран показывал «нет тем» навсегда —
        // теперь явная ошибка с повтором.
        <View style={styles.center}>
          <Icon name="cloud-outline" size={40} color={theme.colors.textTertiary} />
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
            {t('common.error')}
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { borderColor: theme.colors.primary }]}
            onPress={() => refetch()}
            accessibilityRole="button"
          >
            <Text style={{ color: theme.colors.primary, fontFamily: theme.fonts.semibold }}>
              {t('common.refresh', { defaultValue: 'Retry' })}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={threads.filter(th => !isBlocked(th.authorUid))}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              iconName="chatbubble-ellipses-outline"
              iconColor={theme.colors.primary}
              title={t('community.threads')}
              subtitle={t('community.noThreads')}
            />
          }
        />
      )}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('NewThread', { roomId })}
        accessibilityRole="button"
        accessibilityLabel={t('community.newThread')}
      >
        <Icon name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 15, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  list: { padding: 16, gap: 10, paddingBottom: 100, flexGrow: 1 },
  threadCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  threadTitle: { fontSize: 15 },
  threadMeta: { fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});
