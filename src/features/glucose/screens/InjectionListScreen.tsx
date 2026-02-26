import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { injectionRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { InjectionLog } from '@storage/domain/types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card, AnimatedListItem } from '@shared/components/ui';
import { SimpleBarChart, BarData } from '@shared/components/charts/SimpleBarChart';
import { format, parseISO, subDays, isAfter } from 'date-fns';

export default function InjectionListScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['injections', activePet?.id],
    queryFn: ({ pageParam }) =>
      activePet
        ? injectionRepository.findByPetId(activePet.id, 50, pageParam)
        : Promise.resolve({ data: [], nextCursor: null }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!activePet?.id,
  });

  const injections = data?.pages.flatMap(p => p.data) ?? [];

  const chartData = useMemo((): BarData[] => {
    const cutoff = subDays(new Date(), 14);
    const recent = injections.filter(inj => isAfter(parseISO(inj.administeredAt), cutoff));

    const byDay = new Map<string, number>();
    recent.forEach(inj => {
      const day = format(parseISO(inj.administeredAt), 'dd.MM');
      byDay.set(day, (byDay.get(day) ?? 0) + inj.doseUnits);
    });

    return Array.from(byDay.entries())
      .reverse()
      .map(([label, value]) => ({ label, value, color: theme.colors.primary }));
  }, [injections, theme.colors.primary]);

  const handleDelete = (id: string) => {
    Alert.alert(t('injection.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        await injectionRepository.delete(id);
        queryClient.invalidateQueries({ queryKey: ['injections'] });
      }},
    ]);
  };

  const renderItem = ({ item, index }: { item: InjectionLog; index: number }) => (
    <AnimatedListItem index={index}>
      <TouchableOpacity onLongPress={() => handleDelete(item.id)} activeOpacity={0.8}>
        <Card style={styles.card} shadow>
          <View style={[styles.colorBar, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.doseRow}>
                <Ionicons name="medkit-outline" size={18} color={theme.colors.primary} />
                <Text style={[styles.dose, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
                  {item.doseUnits} {t('common.units')}
                </Text>
              </View>
              <Text style={[styles.type, { color: theme.colors.textSecondary }]}>
                {item.insulinType}
              </Text>
              <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
                {formatDateTime(item.administeredAt)}
              </Text>
            </View>
            {item.notes && (
              <Text style={[styles.notes, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>{'← '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>{t('injection.history')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={injections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          chartData.length > 0 ? (
            <Card style={styles.chartCard}>
              <SimpleBarChart
                data={chartData}
                title={t('injection.doseChart')}
                unit={t('common.units')}
              />
            </Card>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loadingFooter} size="small" color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="medkit-outline"
            iconColor={theme.colors.secondary}
            title={t('injection.history')}
            subtitle={t('injection.noHistory')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  list: { padding: 16, gap: 8, paddingBottom: 100 },
  chartCard: { marginBottom: 8 },
  card: { padding: 0, flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 2 },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dose: { fontSize: 18, fontWeight: '700' },
  type: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12, marginTop: 4 },
  notes: { fontSize: 12, marginTop: 4 },
  loadingFooter: { paddingVertical: 16 },
});
