/**
 * Legal document URLs (GitHub Pages, see /docs).
 *
 * Kept here rather than inline in a screen: Google Play's user-data policy
 * requires the privacy policy to be reachable from inside the app, not only
 * from the store listing. Previously these lived in PaywallScreen, which is
 * unreachable while PREMIUM_MODE is `unlocked` — so the links shipped dead.
 */
import i18n from '@shared/i18n';

export const PRIVACY_POLICY_URL = 'https://kur0sava.github.io/diapet/assets/privacy-policy.html';
export const TERMS_OF_SERVICE_URL =
  'https://kur0sava.github.io/diapet/assets/terms-of-service.html';

/** Support inbox — also the address the privacy policy names for data deletion. */
export const SUPPORT_EMAIL = 'giwoder@gmail.com';

/**
 * Append the app's current UI language so the page opens in the language the
 * user reads the app in. Without it the page falls back to the device locale,
 * which is wrong for anyone who switched language inside DiaPet (a Russian
 * speaker on an English phone, and vice versa — both common in this audience).
 */
export function withAppLanguage(url: string): string {
  // Read lazily: this module is imported at startup, before i18n has restored
  // the persisted language, so a value captured at module scope would be stale.
  const lang = (i18n.language ?? 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
  return `${url}?lang=${lang}`;
}
