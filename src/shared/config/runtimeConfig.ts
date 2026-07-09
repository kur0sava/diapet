import Constants from 'expo-constants';

export type PremiumMode = 'hidden' | 'unlocked' | 'billing';

const extra = Constants.expoConfig?.extra ?? {};

function getStringExtra(key: string): string {
  const value = extra[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function getPremiumMode(): PremiumMode {
  const premiumMode = getStringExtra('premiumMode');
  if (premiumMode === 'billing' || premiumMode === 'unlocked' || premiumMode === 'hidden') {
    return premiumMode;
  }
  return 'hidden';
}

export function isMonetizationEnabled(): boolean {
  return getPremiumMode() === 'billing';
}

export function isPremiumHidden(): boolean {
  return getPremiumMode() === 'hidden';
}

export function isPremiumUnlocked(): boolean {
  return getPremiumMode() === 'unlocked';
}

export function getAiProxyUrl(): string {
  return getStringExtra('aiProxyUrl').replace(/\/+$/, '');
}

/**
 * Manifest for the self-updating diabetic food catalog. Default points to a
 * standalone public GitHub repo (raw.githubusercontent.com) so the list can
 * be curated — including by community PRs — without app releases, and keeps
 * working even if the app itself stops being maintained.
 */
const DEFAULT_FOODS_MANIFEST_URL =
  'https://raw.githubusercontent.com/kur0sava/diapet-foods-data/main/foods-manifest.json';

export function getFoodsManifestUrl(): string {
  return getStringExtra('foodsManifestUrl') || DEFAULT_FOODS_MANIFEST_URL;
}

export function getSupabaseAnonKey(): string {
  return getStringExtra('supabaseAnonKey');
}

export function isAiProxyConfigured(): boolean {
  return getAiProxyUrl().length > 0;
}

export function isAiFeatureVisible(): boolean {
  return !isPremiumHidden();
}

export function isAiFeatureEnabled(): boolean {
  return isAiFeatureVisible() && isAiProxyConfigured();
}
