import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlucoseNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { glucoseRepository, injectionRepository, symptomRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { GlucoseReading, getGlucoseColor } from '../types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import { generateVetReportPdf } from '@shared/utils/pdfExport';

export default function GlucoseListScreen() {
  const navigation = useGlucoseNavigation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const activePet = usePetStore(s => s.activePet);
  const queryClient = useQueryClient();
  const unit = storage.getString(StorageKeys.GLUCOSE_UNIT) ?? 'mmol/L';
  const [exporting, setExporting] = useState(false);

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['glucose', 'list', activePet?.id],
    queryFn: () => activePet ? glucoseRepository.findByPetId(activePet.id) : Promise.resolve([]),
    enabled: !!activePet?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['glucose', 'stats', activePet?.id],
    queryFn: () => activePet ? glucoseRepository.getStats(activePet.id) : Promise.resolve({ avg: 0, min: 0, max: 0, count: 0 }),
    enabled: !!activePet?.id,
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      t('glucose.deleteConfirm'),
      undefined,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await glucoseRepository.delete(id);
            queryClient.invalidateQueries({ queryKey: ['glucose'] });
          },
        },
      ]
    );
  };

  const mealLabels: Record<string, string> = {
    before_meal: t('glucose.beforeMeal'),
    after_meal: t('glucose.afterMeal'),
    fasting: t('glucose.fasting'),
    unspecified: '',
  };

  const handleExportPdf = useCallback(async () => {
    if (!activePet) return;
    setExporting(true);
    try {
      const [injections, symptoms] = await Promise.all([
        injectionRepository.findByPetId(activePet.id),
        symptomRepository.findByPetId(activePet.id),
      ]);
      await generateVetReportPdf({
        pet: activePet,
        glucoseReadings: readings,
        injections,
        symptoms,
      });
    } catch (e) {
      Alert.alert(t('common.error'), String(e));
    } finally {
      setExporting(false);
    }
  }, [activePet, readings, t]);

  const renderReading = ({ item }: { item: GlucoseReading }) => {
    const displayValue = unit === 'mmol/L' ? `${item.valueMmol.toFixed(1)}` : `${item.valueMgdl}`;
    const color = getGlucoseColor(item.valueMmol);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('LogGlucose', { editId: item.id })}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
      >
        <Card style={styles.readingCard} shadow>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
          <View style={styles.readingContent}>
            <View>
              <Text style={[styles.readingValue, { color: theme.colors.text }]}>
                {displayValue} <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>{unit}</Text>
              </Text>
              <Text style={[styles.readingTime, { color: theme.colors.textSecondary }]}>
                {formatDateTime(item.recordedAt)}
                {item.mealRelation !== 'unspecified' ? ` · ${mealLabels[item.mealRelation]}` : ''}
              </Text>
              {item.insulinDose && (
                <Text style={[styles.readingInsulin, { color: theme.colors.textTertiary }]}>
                  💉 {item.insulinDose} ед. {item.insulinType ?? ''}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Stats Bar */}
      {stats && stats.count > 0 && (
        <Card style={styles.statsCard} shadow={false}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.avg.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.average')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.min.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.min')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.danger }]}>{stats.max.toFixed(1)}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.max')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.count}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('glucose.stats.total')}</Text>
            </View>
          </View>
        </Card>
      )}

      <FlatList
        data={readings}
        keyExtractor={item => item.id}
        renderItem={renderReading}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="💧"
            title={t('glucose.title')}
            subtitle={t('glucose.noReadings')}
            actionLabel={t('glucose.addReading')}
            onAction={() => navigation.navigate('LogGlucose', {})}
          />
        }
      />

      {/* Export PDF FAB */}
      {readings.length > 0 && (
        <TouchableOpacity
          style={[styles.fabExport, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
          onPress={handleExportPdf}
          activeOpacity={0.8}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="document-text-outline" size={22} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('LogGlucose', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsCard: { margin: 16, marginBottom: 0, borderRadius: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', padding: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  list: { padding: 16, gap: 8, paddingBottom: 100 },
  readingCard: { padding: 0, flexDirection: 'row', overflow: 'hidden' },
  colorBar: { width: 4 },
  readingContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  readingValue: { fontSize: 20, fontWeight: '700' },
  readingTime: { fontSize: 13, marginTop: 2 },
  readingInsulin: { fontSize: 12, marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabExport: { position: 'absolute', bottom: 90, right: 20, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, borderWidth: 1.5 },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300' },
});
