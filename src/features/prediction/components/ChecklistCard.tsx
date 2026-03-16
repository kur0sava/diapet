/**
 * Actionable recommendations checklist from AI prediction.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';
import type { IoniconName } from '@shared/components/ui';
import type { PredictionChecklist, ChecklistCategory, ChecklistPriority } from '../data/predictionTypes';

interface Props {
  items: PredictionChecklist[];
}

const CATEGORY_ICONS: Record<ChecklistCategory, IoniconName> = {
  feeding: 'restaurant-outline',
  glucose_check: 'water-outline',
  injection: 'medkit-outline',
  vet_visit: 'medical-outline',
  general: 'bulb-outline',
};

export function ChecklistCard({ items }: Props) {
  const { theme } = useTheme();

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <ChecklistItem key={index} item={item} theme={theme} />
      ))}
    </View>
  );
}

function ChecklistItem({ item, theme }: { item: PredictionChecklist; theme: ReturnType<typeof useTheme>['theme'] }) {
  const [expanded, setExpanded] = useState(false);

  const priorityColors: Record<ChecklistPriority, string> = {
    high: theme.colors.danger,
    medium: theme.colors.warning,
    low: theme.colors.info,
  };

  const color = priorityColors[item.priority];
  const icon = CATEGORY_ICONS[item.category] ?? 'bulb-outline';

  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: `${color}10`, borderLeftColor: color }]}
      onPress={() => setExpanded(prev => !prev)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <Ionicons name={icon} size={18} color={color} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={expanded ? undefined : 2}>
          {item.title}
        </Text>
        {item.timing && (
          <View style={[styles.timingBadge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.timingText, { color }]}>{item.timing}</Text>
          </View>
        )}
      </View>
      {expanded && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  item: {
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  icon: { marginRight: 4 },
  title: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  timingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timingText: { fontSize: 11, fontWeight: '600' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 8 },
});
