import React, { ReactNode } from 'react';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface Props {
  children: ReactNode;
  index: number;
}

export function AnimatedListItem({ children, index }: Props) {
  return (
    <Animated.View entering={FadeInRight.delay(Math.min(index * 50, 300)).duration(300)}>
      {children}
    </Animated.View>
  );
}
