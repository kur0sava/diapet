/**
 * Subscription API client — communicates with Supabase backend.
 * Handles subscription status checks and Prodamus payment URL generation.
 */
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import { getDeviceId } from '@shared/utils/deviceId';

const extra = Constants.expoConfig?.extra ?? {};
const SUPABASE_URL = (extra.supabaseUrl as string) || '';
const SUPABASE_ANON_KEY = (extra.supabaseAnonKey as string) || '';
const PRODAMUS_SHOP_URL = (extra.prodamusShopUrl as string) || '';

export type SubscriptionPlan = 'monthly' | 'yearly';

export interface SubscriptionStatus {
  isPro: boolean;
  plan: SubscriptionPlan | null;
  expiresAt: string | null;
}

/**
 * Check subscription status via Supabase Edge Function.
 */
export async function checkSubscription(): Promise<SubscriptionStatus> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Backend not configured — dev/bypass mode
    return { isPro: false, plan: null, expiresAt: null };
  }

  const deviceId = getDeviceId();

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/check-subscription?device_id=${encodeURIComponent(deviceId)}`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Subscription check failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    isPro: data.isPro ?? false,
    plan: data.plan ?? null,
    expiresAt: data.expiresAt ?? null,
  };
}

/**
 * Poll subscription status after payment (with retries).
 */
export async function pollSubscriptionAfterPayment(
  maxRetries = 5,
  delayMs = 3000,
): Promise<SubscriptionStatus> {
  for (let i = 0; i < maxRetries; i++) {
    const status = await checkSubscription();
    if (status.isPro) return status;
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return { isPro: false, plan: null, expiresAt: null };
}

/** Price configuration — will be updated when Prodamus shop is set up */
export const PLANS = {
  monthly: { price: 399, currency: 'RUB', priceDisplay: '399 ₽/мес', priceDisplayEn: '$3.99/mo' },
  yearly: { price: 3390, currency: 'RUB', priceDisplay: '3 390 ₽/год', priceDisplayEn: '$39.99/yr' },
} as const;

/**
 * Open Prodamus payment page in external browser.
 */
export function openPaymentPage(plan: SubscriptionPlan): void {
  if (!PRODAMUS_SHOP_URL) {
    console.warn('Prodamus shop URL not configured');
    return;
  }

  const deviceId = getDeviceId();
  const planConfig = PLANS[plan];

  const params = new URLSearchParams({
    customer_extra: deviceId,
    products: JSON.stringify([{
      name: `DiaPet Pro — ${plan}`,
      price: String(planConfig.price),
      quantity: 1,
    }]),
    do: 'pay',
  });

  const url = `${PRODAMUS_SHOP_URL}?${params.toString()}`;
  Linking.openURL(url);
}

/**
 * Returns true if backend is configured (Supabase URL + key present).
 */
export function isBackendConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}
