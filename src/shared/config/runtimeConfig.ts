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

/**
 * Community/Chat feature flag. Скрыт по умолчанию (как AiTab) — клиент готов,
 * но включать в проде НЕЛЬЗЯ до деплоя бэкенд-инфры (firestore.rules/индексы,
 * серверный AI-модератор+бан) и решения юр-части (152-ФЗ ПД РФ, UGC-privacy,
 * возрастной рейтинг). PM launch-readiness review 2026-07-18: 3 независимых
 * способа получить бан/1★ при нулевой пользе (пустые комнаты + перевод не
 * работает без прокси). Включать не раньше v3.1 поверх живого бэкенда.
 * Для дев-теста задать extra.chatEnabled = true в eas.json/.env.
 */
export function isChatFeatureEnabled(): boolean {
  const flag = extra['chatEnabled'];
  return flag === true || flag === 'true';
}

export function isAiFeatureEnabled(): boolean {
  return isAiFeatureVisible() && isAiProxyConfigured();
}
