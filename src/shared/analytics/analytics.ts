/**
 * Analytics — Firebase Analytics wrapper.
 *
 * Tracks anonymous usage events for install/DAU/retention/funnel metrics.
 * No PII is logged (no pet names, no glucose values, no symptoms text).
 *
 * Firebase Analytics auto-tracks: app_open, screen_view (when wired),
 * first_open, session_start, user_engagement.
 *
 * google-services.json is bundled at build time; analytics() auto-initializes
 * from native config — no manual init call required.
 */
import analytics from '@react-native-firebase/analytics';
import { storage, StorageKeys } from '@storage/mmkv/storage';

let collectionEnabledCached: boolean | null = null;

export function isAnalyticsEnabled(): boolean {
  if (collectionEnabledCached !== null) return collectionEnabledCached;
  const optedOut = storage.getBoolean(StorageKeys.ANALYTICS_OPT_OUT) ?? false;
  collectionEnabledCached = !optedOut;
  return collectionEnabledCached;
}

export async function setAnalyticsOptOut(optedOut: boolean): Promise<void> {
  storage.set(StorageKeys.ANALYTICS_OPT_OUT, optedOut);
  collectionEnabledCached = !optedOut;
  try {
    await analytics().setAnalyticsCollectionEnabled(!optedOut);
  } catch (e) {
    console.warn('Failed to toggle analytics collection:', e);
  }
}

/**
 * Apply current opt-in/out state to Firebase. Call once on app start.
 */
export async function initAnalytics(): Promise<void> {
  try {
    await analytics().setAnalyticsCollectionEnabled(isAnalyticsEnabled());
  } catch (e) {
    console.warn('Failed to init analytics:', e);
  }
}

type EventName =
  | 'onboarding_complete'
  | 'onboarding_skipped'
  | 'glucose_added'
  | 'symptom_added'
  | 'injection_added'
  | 'feeding_added'
  | 'pet_added'
  | 'encyclopedia_article_opened'
  | 'feed_calculator_used'
  | 'pdf_export'
  | 'ai_chat_message_sent'
  | 'paywall_viewed';

type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Log an analytics event. Silently swallows errors so a failed analytics call
 * never breaks user flow.
 */
export function logEvent(name: EventName, params?: EventParams): void {
  if (!isAnalyticsEnabled()) return;

  // Fire-and-forget — analytics() is a noop on the JS side until the next
  // batch upload, so awaiting just adds latency to user actions.
  analytics()
    .logEvent(name, params)
    .catch(e => {
      if (__DEV__) console.warn('analytics.logEvent failed:', name, e);
    });
}

/**
 * Set a non-PII user property (e.g. species of active pet, app premium mode).
 */
export function setUserProperty(name: string, value: string | null): void {
  if (!isAnalyticsEnabled()) return;
  analytics()
    .setUserProperty(name, value)
    .catch(e => {
      if (__DEV__) console.warn('analytics.setUserProperty failed:', name, e);
    });
}
