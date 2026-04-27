/**
 * Subscription API client — communicates with Supabase backend.
 *
 * Payment provider is currently UNCONFIGURED (Prodamus dropped in v2.5.0,
 * incompatible with Google Play). The shape is provider-agnostic so adding
 * a new provider (Stripe / Tinkoff / YooKassa / etc.) requires only
 * implementing `openPaymentPage` below + setting the env var that drives
 * `isPaymentProviderConfigured()`.
 */
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import { getDeviceId } from '@shared/utils/deviceId';

const extra = Constants.expoConfig?.extra ?? {};
const SUPABASE_URL = (extra.supabaseUrl as string) || '';
const SUPABASE_ANON_KEY = (extra.supabaseAnonKey as string) || '';
const PAYMENT_PROVIDER_URL = (extra.paymentProviderUrl as string) || '';

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface SubscriptionStatus {
  isPro: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
}

const SUBSCRIPTION_CHECK_TIMEOUT_MS = 15_000;

/**
 * Check subscription status via Supabase Edge Function.
 *
 * H3: bounded by an AbortController timeout so a slow/dead Supabase region
 * can't hang the JS thread on AppState→active or App.tsx init.
 */
export async function checkSubscription(): Promise<SubscriptionStatus> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { isPro: false, plan: null, expiresAt: null };
  }

  const deviceId = getDeviceId();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBSCRIPTION_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/check-subscription?device_id=${encodeURIComponent(deviceId)}`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const err = new Error(`Subscription check failed: ${response.status}`) as Error & {
        status: number;
      };
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return {
      isPro: data.isPro ?? false,
      plan: data.plan ?? null,
      expiresAt: data.expiresAt ?? null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Poll subscription status after payment (with retries).
 */
export async function pollSubscriptionAfterPayment(
  maxRetries = 6,
  initialDelayMs = 2000
): Promise<SubscriptionStatus> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await checkSubscription();
      if (status.isPro) return status;
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 401 || status === 403) throw e;
    }
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, initialDelayMs * Math.pow(2, i)));
    }
  }
  return { isPro: false, plan: null, expiresAt: null };
}

/** Display-only price stubs — replace prices when wiring a provider. */
export const PLANS = {
  monthly: { price: 399, currency: 'RUB', priceDisplay: '399 ₽/мес', priceDisplayEn: '$3.99/mo' },
  yearly: {
    price: 3390,
    currency: 'RUB',
    priceDisplay: '3 390 ₽/год',
    priceDisplayEn: '$39.99/yr',
  },
} as const;

/**
 * Open the payment provider's checkout page in an external browser.
 *
 * STUB until a provider is wired. To activate:
 *   1. Set `PAYMENT_PROVIDER_URL` in .env (and `paymentProviderUrl` in
 *      app.config.ts extra).
 *   2. Replace the body below with provider-specific URL construction.
 *
 * The signature stays stable so all callers (PaywallScreen, store action)
 * keep working without churn.
 */
export function openPaymentPage(plan: SubscriptionPlan): void {
  if (!PAYMENT_PROVIDER_URL) {
    return;
  }

  const deviceId = getDeviceId();
  const planConfig = PLANS[plan];

  const params = new URLSearchParams({
    customer_extra: deviceId,
    plan,
    price: String(planConfig.price),
  });

  const url = `${PAYMENT_PROVIDER_URL}?${params.toString()}`;
  Linking.openURL(url).catch(e => console.warn('Failed to open payment URL:', e));
}

/**
 * Returns true if backend is configured (Supabase URL + key present).
 * Used by UI to decide whether to render real plans vs "Coming Soon".
 */
export function isBackendConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Returns true if a payment provider URL is configured. Once wired, the
 * Paywall flips from "Coming Soon" to interactive plan selection + checkout.
 */
export function isPaymentProviderConfigured(): boolean {
  return !!PAYMENT_PROVIDER_URL;
}
