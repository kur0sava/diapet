import { useSubscriptionStore, isBackendConfigured } from '@shared/stores/subscriptionStore';
import { isTrialActive, trialDaysLeft, hasTrialStarted, isTrialExpired } from '../utils/trial';

export function useSubscription() {
  const isPaidPro = useSubscriptionStore(s => s.isPro);

  const trialActive = isTrialActive();
  const daysLeft = trialDaysLeft();
  const trialStarted = hasTrialStarted();
  const trialExpired = isTrialExpired();

  // Bypass paywall only in dev when backend is not configured.
  // In production builds, missing credentials must NOT grant Pro.
  const devBypass = __DEV__ && !isBackendConfigured();
  const effectivePro = isPaidPro || trialActive || devBypass;

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
