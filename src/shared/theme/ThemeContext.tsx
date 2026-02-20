import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './colors';
import { FontFamily, FontWeight, FontSize, LineHeight } from './typography';
import { Spacing, BorderRadius, Shadow } from './spacing';
import { storage } from '@storage/mmkv/storage';

export type ColorScheme = 'light' | 'dark' | 'system';

export type Theme = {
  colors: typeof Colors.light & {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    danger: string;
    dangerLight: string;
    info: string;
    infoLight: string;
    glucoseLow: string;
    glucoseNormal: string;
    glucoseHigh: string;
    glucoseVeryHigh: string;
  };
  fonts: typeof FontFamily;
  fontWeights: typeof FontWeight;
  fontSizes: typeof FontSize;
  lineHeights: typeof LineHeight;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadow;
  isDark: boolean;
};

const buildTheme = (isDark: boolean): Theme => {
  const scheme = isDark ? Colors.dark : Colors.light;
  return {
    colors: {
      ...scheme,
      primary: Colors.primary,
      primaryDark: Colors.primaryDark,
      primaryLight: Colors.primaryLight,
      secondary: Colors.secondary,
      secondaryLight: Colors.secondaryLight,
      success: Colors.success,
      successLight: Colors.successLight,
      warning: Colors.warning,
      warningLight: Colors.warningLight,
      danger: Colors.danger,
      dangerLight: Colors.dangerLight,
      info: Colors.info,
      infoLight: Colors.infoLight,
      glucoseLow: Colors.glucoseLow,
      glucoseNormal: Colors.glucoseNormal,
      glucoseHigh: Colors.glucoseHigh,
      glucoseVeryHigh: Colors.glucoseVeryHigh,
    },
    fonts: FontFamily,
    fontWeights: FontWeight,
    fontSizes: FontSize,
    lineHeights: LineHeight,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadow,
    isDark,
  };
};

type ThemeContextType = {
  theme: Theme;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('system');

  useEffect(() => {
    const saved = storage.getString('colorScheme') as ColorScheme | undefined;
    if (saved) setColorSchemeState(saved);
  }, []);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    storage.set('colorScheme', scheme);
  };

  const isDark =
    colorScheme === 'system' ? systemScheme === 'dark' : colorScheme === 'dark';

  const theme = buildTheme(isDark);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
