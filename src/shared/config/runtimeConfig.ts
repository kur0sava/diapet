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
