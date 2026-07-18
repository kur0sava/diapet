import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Icon, type IconName } from './Icon';

type BadgeSize = 'sm' | 'md' | 'lg';

interface Props {
  name: IconName;
  /** sm 32 / md 40 / lg 48 (design G4 — one scale instead of 5 ad-hoc circles). */
  size?: BadgeSize;
  /** Icon (foreground) colour. */
  color: string;
  /** Circle background. Pass a low-alpha tint of `color` for the common look. */
  background: string;
  style?: ViewStyle;
}

const CIRCLE: Record<BadgeSize, number> = { sm: 32, md: 40, lg: 48 };
const ICON: Record<BadgeSize, number> = { sm: 18, md: 22, lg: 26 };

/**
 * Round icon badge (v2.6 batch 5, G4) — the canonical replacement for the
 * hand-rolled `width/height/borderRadius` icon circles scattered across
 * screens at 5 different sizes. Foreground/background colours stay explicit
 * so callers keep their semantic palette.
 */
export function IconBadge({ name, size = 'md', color, background, style }: Props) {
  const dim = CIRCLE[size];
  return (
    <View
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: background },
        style,
      ]}
    >
      <Icon name={name} size={ICON[size]} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
