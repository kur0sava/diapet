import { useSubscriptionStore, isBackendConfigured } from '@shared/stores/subscriptionStore';
import { isTrialActive, trialDaysLeft, hasTrialStarted, isTrialExpired } from '../utils/trial';

export function useSubscription() {
  const isPaidPro = useSubscriptionStore(s => s.isPro);

  const trialActive = isTrialActive();
  const daysLeft = trialDaysLeft();
  const trialStarted = hasTrialStarted();
  const trialExpired = isTrialExpired();

  // While the payment backend is not configured, the UI explicitly shows a
  // "Coming Soon — all features unlocked" state (PaywallScreen, SubscriptionScreen).
  // To keep gating consistent with that promise, grant Pro access whenever
  // isBackendConfigured() is false — in both __DEV__ and production builds.
  // Once Supabase + Prodamus are wired in ETAP 13, this branch becomes a no-op.
  const backendBypass = !isBackendConfigured();
  const effectivePro = isPaidPro || trialActive || backendBypass;

  return {
    isPro: effectivePro,
    isPaidPro,
    isTrialActive: trialActive,
    trialDaysLeft: daysLeft,
    hasTrialStarted: trialStarted,
    isTrialExpired: trialExpired,
    canAddPet: (currentCount: number) => effectivePro || currentCount < 1,
    canExportPDF: () => effectivePro,
    canAccessAdvanced: () => effectivePro,
    canAccessUnlimitedHistory: () => effectivePro,
  };
}
