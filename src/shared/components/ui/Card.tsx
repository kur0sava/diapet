import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: boolean;
  bordered?: boolean;
}

export function Card({ children, style, padding = 16, shadow = true, bordered = true }: CardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding,
          ...(shadow ? theme.shadows.md : {}),
          ...(bordered ? { borderWidth: 1, borderColor: theme.colors.border } : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
