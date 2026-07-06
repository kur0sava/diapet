import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './colors';
import { FontFamily, FontWeight, FontSize, LineHeight } from './typography';
import { Spacing, BorderRadius, Shadow } from './spacing';
import { storage, StorageKeys } from '@storage/mmkv/storage';
import type { PetSpecies } from '@storage/domain/types';
import { getSpeciesConfig } from '@shared/config/speciesConfig';
import { usePetStore } from '@shared/stores/petStore';

export type ColorScheme = 'light' | 'dark' | 'system';

/** Scheme-dependent colors — identical keys in light/dark, but different values */
type ThemeSchemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  divider: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  placeholder: string;
  shadow: string;
  overlay: string;
  card: string;
  tabBar: string;
  tabBarInactive: string;
  header: string;
  statusBar: 'dark-content' | 'light-content';
};

export type Theme = {
  colors: ThemeSchemeColors & {
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
  gradients: typeof Colors.gradients;
  fonts: typeof FontFamily;
  fontWeights: typeof FontWeight;
  fontSizes: typeof FontSize;
  lineHeights: typeof LineHeight;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadow;
  isDark: boolean;
};

const buildTheme = (isDark: boolean, species: PetSpecies = 'cat'): Theme => {
  const scheme = isDark ? Colors.dark : Colors.light;
  const speciesTheme = getSpeciesConfig(species).theme;
  return {
    colors: {
      ...scheme,
      primary: speciesTheme.primary,
      primaryDark: speciesTheme.primaryDark,
      primaryLight: speciesTheme.primaryLight,
      secondary: speciesTheme.secondary,
      secondaryLight: speciesTheme.secondaryLight,
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
    gradients: {
      ...Colors.gradients,
      primary: [speciesTheme.primary, speciesTheme.secondary] as readonly [string, string],
      header: speciesTheme.gradientHeader,
      headerDark: speciesTheme.gradientHeaderDark,
      headerRich: speciesTheme.gradientHeaderRich,
      headerRichDark: speciesTheme.gradientHeaderRichDark,
      cardAccent: speciesTheme.gradientCardAccent,
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

/**
 * Species-aware theme provider.
 * Accepts optional species prop (used during onboarding before petStore is initialized).
 * After onboarding, reads species from the active pet in petStore.
 */
export function ThemeProvider({
  children,
  species: speciesProp,
}: {
  children: ReactNode;
  species?: PetSpecies;
}) {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = storage.getString('colorScheme') as ColorScheme | undefined;
    return saved ?? 'system';
  });

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    storage.set('colorScheme', scheme);
  }, []);

  const isDark = colorScheme === 'system' ? systemScheme === 'dark' : colorScheme === 'dark';

  // Subscribe to active pet's species so the theme updates reactively when the
  // user switches pets. Fall back to MMKV cache (fast path, used on cold start
  // before petStore has finished loadPets) and to 'cat' as final default.
  const activePetSpecies = usePetStore(s => s.activePet?.species);
  // The MMKV fallback must be reactive too: during onboarding PetInfoScreen
  // writes ACTIVE_SPECIES on species select expecting the theme to switch
  // live, but a plain storage read here only re-evaluates when something
  // else re-renders the provider. Listen for the key change explicitly.
  const [mmkvSpecies, setMmkvSpecies] = useState<PetSpecies | undefined>(
    () => storage.getString(StorageKeys.ACTIVE_SPECIES) as PetSpecies | undefined
  );
  useEffect(() => {
    const sub = storage.addOnValueChangedListener(changedKey => {
      if (changedKey === StorageKeys.ACTIVE_SPECIES) {
        setMmkvSpecies(storage.getString(StorageKeys.ACTIVE_SPECIES) as PetSpecies | undefined);
      }
    });
    return () => sub.remove();
  }, []);
  const species = speciesProp ?? activePetSpecies ?? mmkvSpecies ?? 'cat';

  const theme = useMemo(() => buildTheme(isDark, species), [isDark, species]);

  const contextValue = useMemo(
    () => ({ theme, colorScheme, setColorScheme }),
    [theme, colorScheme, setColorScheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
