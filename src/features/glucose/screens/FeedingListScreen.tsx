import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@shared/components/ui/Icon';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@shared/utils/queryKeys';
import { feedingRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { FeedingLog } from '@storage/domain/types';
import { formatDateTime, formatShortDate, formatFullDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card, AnimatedListItem, ScreenHeader } from '@shared/components/ui';
import { SimpleBarChart, BarData } from '@shared/components/charts/SimpleBarChart';
import { LinearGradient } from 'expo-linear-gradient';
import { parseISO, subDays, isAfter } from 'date-fns';

const FOOD_TYPE_ICONS: Record<string, string> = {
  dry: 'nutrition-outline',
  wet: 'flask-outline',
  medical: 'medical-outline',
  natural: 'leaf-outline',
  other: 'restaurant-outline',
};

export default function FeedingListScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: queryKeys.feedings.list(activePet?.id ?? ''),
    queryFn: ({ pageParam }) =>
      activePet
        ? feedingRepository.findByPetId(activePet.id, 50, pageParam)
        : Promise.resolve({ data: [], nextCursor: null }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: !!activePet?.id,
  });

  const feedings = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);

  const chartData = useMemo((): BarData[] => {
    const cutoff = subDays(new Date(), 14);
    const recent = feedings.filter(f => isAfter(parseISO(f.fedAt), cutoff));

    const byDay = new Map<string, number>();
    recent.forEach(f => {
      const day = formatShortDate(f.fedAt);
      byDay.set(day, (byDay.get(day) ?? 0) + (f.amountGrams ?? 0));
    });

    return Array.from(byDay.entries())
      .reverse()
      .map(([label, value]) => ({ label, value, color: theme.colors.success }));
  }, [feedings, theme.colors.success]);

  const foodLabel = (type?: string) => {
    if (!type) return t('feeding.other');
    const key = `feeding.${type}` as const;
    return t(key);
  };

  const handleDelete = (id: string) => {
    const item = feedings.find(f => f.id === id);
    const info = item
      ? `${formatFullDateTime(item.fedAt)} — ${foodLabel(item.foodType)}${item.amountGrams != null ? `, ${item.amountGrams} ${t('common.grams')}` : ''}`
      : '';
    Alert.alert(t('feeding.deleteConfirm'), info || undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await feedingRepository.delete(id);
            queryClient.invalidateQueries({ queryKey: queryKeys.feedings.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.diary.all });
          } catch {
            Alert.alert(t('common.error'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item, index }: { item: FeedingLog; index: number }) => (
    <AnimatedListItem index={index}>
      <TouchableOpacity
        onPress={() => navigation.navigate('LogFeeding', { editId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
      >
        <Card style={styles.card} shadow>
          <View style={[styles.colorBar, { backgroundColor: theme.colors.success }]} />
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.foodTypeRow}>
                <Icon
                  name={FOOD_TYPE_ICONS[item.foodType ?? 'other'] ?? 'restaurant-outline'}
                  size={18}
                  color={theme.colors.success}
                />
                <Text
                  style={[
                    styles.foodType,
                    { color: theme.colors.text, fontFamily: theme.fonts.bold },
                  ]}
                >
                  {foodLabel(item.foodType)}
                </Text>
              </View>
              {item.amountGrams != null && (
                <Text style={[styles.amount, { color: theme.colors.textSecondary }]}>
                  {item.amountGrams} {t('common.grams')}
                </Text>
              )}
              <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
                {formatDateTime(item.fedAt)}
              </Text>
            </View>
            {item.notes && (
              <Text style={[styles.notes, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ alignSelf: 'flex-start' }}
            >
              <Icon name="trash-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={t('feeding.history')} onBack={() => navigation.goBack()} />

      <FlatList
        data={feedings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          chartData.length > 0 ? (
            <Card style={styles.chartCard}>
              <SimpleBarChart data={chartData} title={t('feeding.amountChart')} unit="g" />
            </Card>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              style={styles.loadingFooter}
              size="small"
              color={theme.colors.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="restaurant-outline"
            iconColor={theme.colors.success}
            title={t('feeding.history')}
            subtitle={t('feeding.noHistory')}
            actionLabel={t('feeding.addEntry')}
            onAction={() => navigation.navigate('LogFeeding')}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity onPress={() => navigation.navigate('LogFeeding')} activeOpacity={0.8}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fab, theme.shadows.primarySm]}
        >
          <Icon name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 8, paddingBottom: 100 },
  chartCard: { marginBottom: 8 },
  card: { padding: 0, flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 2 },
  foodTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  foodType: { fontSize: 16, fontWeight: '700' },
  amount: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12, marginTop: 4 },
  notes: { fontSize: 12, marginTop: 4 },
  loadingFooter: { paddingVertical: 16 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
