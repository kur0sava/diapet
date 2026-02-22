import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { feedingRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { FeedingLog } from '@storage/domain/types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card } from '@shared/components/ui';
import { SimpleBarChart, BarData } from '@shared/components/charts/SimpleBarChart';
import { format, parseISO, subDays, isAfter } from 'date-fns';

const FOOD_TYPE_ICONS: Record<string, string> = {
  dry: '🥣',
  wet: '🥫',
  medical: '💊',
  other: '🍽️',
};

export default function FeedingListScreen() {
  const navigation = useHomeNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();

  const { data: feedings = [] } = useQuery({
    queryKey: ['feedings', activePet?.id],
    queryFn: () => activePet ? feedingRepository.findByPetId(activePet.id, 100) : Promise.resolve([]),
    enabled: !!activePet?.id,
  });

  const chartData = useMemo((): BarData[] => {
    const cutoff = subDays(new Date(), 14);
    const recent = feedings.filter(f => isAfter(parseISO(f.fedAt), cutoff));

    const byDay = new Map<string, number>();
    recent.forEach(f => {
      const day = format(parseISO(f.fedAt), 'dd.MM');
      byDay.set(day, (byDay.get(day) ?? 0) + (f.amountGrams ?? 0));
    });

    return Array.from(byDay.entries())
      .reverse()
      .map(([label, value]) => ({ label, value, color: theme.colors.success }));
  }, [feedings, theme.colors.success]);

  const handleDelete = (id: string) => {
    Alert.alert(t('feeding.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        await feedingRepository.delete(id);
        queryClient.invalidateQueries({ queryKey: ['feedings'] });
      }},
    ]);
  };

  const foodLabel = (type?: string) => {
    if (!type) return t('feeding.other');
    const key = `feeding.${type}` as const;
    return t(key);
  };

  const renderItem = ({ item }: { item: FeedingLog }) => (
    <TouchableOpacity onLongPress={() => handleDelete(item.id)} activeOpacity={0.8}>
      <Card style={styles.card} shadow>
        <View style={[styles.colorBar, { backgroundColor: theme.colors.success }]} />
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.foodType, { color: theme.colors.text }]}>
              {FOOD_TYPE_ICONS[item.foodType ?? 'other'] ?? '🍽️'} {foodLabel(item.foodType)}
            </Text>
            {item.amountGrams != null && (
              <Text style={[styles.amount, { color: theme.colors.textSecondary }]}>
                {item.amountGrams} {t('feeding.amountGrams').replace(/\(.*\)/, '').trim()}
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
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.navHeader, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.colors.primary }}>{'← '}{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('feeding.history')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={feedings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          chartData.length > 0 ? (
            <Card style={styles.chartCard}>
              <SimpleBarChart
                data={chartData}
                title={t('feeding.amountChart')}
                unit="g"
              />
            </Card>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="🍽️"
            title={t('feeding.history')}
            subtitle={t('feeding.noHistory')}
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
  foodType: { fontSize: 16, fontWeight: '700' },
  amount: { fontSize: 14, marginTop: 2 },
  time: { fontSize: 12, marginTop: 4 },
  notes: { fontSize: 12, marginTop: 4 },
});
