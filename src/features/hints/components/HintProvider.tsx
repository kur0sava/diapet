import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { HintCard } from './HintCard';
import { AchievementModal } from './AchievementModal';
import { SuccessToast } from '@shared/components/ui/SuccessToast';

interface Props {
  children: ReactNode;
}

/**
 * HintProvider wraps the full app content and renders HintCard + AchievementModal
 * as overlays on top of all screens.
 *
 * The wrapper View uses flex:1 so the app fills the screen normally.
 * HintCard is absolutely positioned inside the wrapper.
 * pointerEvents="box-none" on the wrapper ensures it does NOT swallow
 * touches — only HintCard and AchievementModal intercept touches
 * when they are actually visible.
 */
export function HintProvider({ children }: Props) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {children}
      <HintCard />
      <AchievementModal />
      <SuccessToast />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});
