import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSymptomsNavigation } from '@navigation/hooks';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { symptomRepository } from '@storage/database';
import { usePetStore } from '@shared/stores/petStore';
import { SymptomEntry, SYMPTOM_ICONS } from '../types';
import { formatDateTime } from '@shared/utils/dateUtils';
import { EmptyState, Card, AnimatedListItem } from '@shared/components/ui';

export default function SymptomsListScreen() {
  const navigation = useSymptomsNavigation();
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
    queryKey: ['symptoms', activePet?.id],
    queryFn: ({ pageParam }) =>
      activePet
        ? symptomRepository.findByPetId(activePet.id, 50, pageParam)
        : Promise.resolve({ data: [], nextCursor: null }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!activePet?.id,
  });

  const symptoms = data?.pages.flatMap(p => p.data) ?? [];

  const severityColors: Record<string, string> = {
    mild: theme.colors.success,
    moderate: theme.colors.warning,
    severe: theme.colors.danger,
  };

  const severityLabels: Record<string, string> = {
    mild: t('symptoms.mild'),
    moderate: t('symptoms.moderate'),
    severe: t('symptoms.severe'),
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('symptoms.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => {
        await symptomRepository.delete(id);
        queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      }},
    ]);
  };

  const renderSymptom = ({ item, index }: { item: SymptomEntry; index: number }) => (
    <AnimatedListItem index={index}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SymptomDetail', { id: item.id })}
        onLongPress={() => handleDelete(item.id)}
        activeOpacity={0.8}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconsRow}>
              {item.symptomTypes.slice(0, 4).map(type => (
                <Ionicons key={type} name={SYMPTOM_ICONS[type] as any} size={18} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
              ))}
              {item.symptomTypes.length > 4 && (
                <Text style={[styles.moreCount, { color: theme.colors.textSecondary }]}>
                  +{item.symptomTypes.length - 4}
                </Text>
              )}
            </View>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColors[item.severity]}20` }]}>
              <Text style={[styles.severityText, { color: severityColors[item.severity], fontFamily: theme.fonts.bold }]}>
                {severityLabels[item.severity]}
              </Text>
            </View>
          </View>
          <Text style={[styles.symptomsText, { color: theme.colors.text, fontFamily: theme.fonts.bold }]}>
            {item.symptomTypes.map(s => t(`symptoms.types.${s}`)).join(', ')}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{formatDateTime(item.recordedAt)}</Text>
          {item.notes && <Text style={[styles.notes, { color: theme.colors.textTertiary }]} numberOfLines={2}>{item.notes}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {item.photoUris.length > 0 ? (
              <View style={styles.photosRow}>
                <Ionicons name="camera-outline" size={15} color={theme.colors.primary} />
                <Text style={[styles.photos, { color: theme.colors.primary }]}>
                  {item.photoUris.length} {t('symptoms.photos')}
                </Text>
              </View>
            ) : <View />}
            <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    </AnimatedListItem>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={symptoms}
        keyExtractor={item => item.id}
        renderItem={renderSymptom}
        contentContainerStyle={styles.list}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          symptoms.length > 0 ? (
            <Text style={[styles.hintText, { color: theme.colors.textTertiary }]}>{t('common.longPressToDelete')}</Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={styles.loadingFooter} size="small" color={theme.colors.primary} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            iconName="paw-outline"
            iconColor={theme.colors.warning}
            title={t('symptoms.title')}
            subtitle={t('symptoms.noSymptoms')}
            actionLabel={t('symptoms.addSymptom')}
            onAction={() => navigation.navigate('AddSymptom', {})}
          />
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddSymptom', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  card: { gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconsRow: { flexDirection: 'row', gap: 4 },
  symptomIcon: { fontSize: 20 },
  moreCount: { fontSize: 14, alignSelf: 'center' },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 12, fontWeight: '600' },
  symptomsText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  date: { fontSize: 12 },
  notes: { fontSize: 13 },
  photosRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photos: { fontSize: 13, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  loadingFooter: { paddingVertical: 16 },
  hintText: { fontSize: 12, textAlign: 'center', marginBottom: 8 },
});
