import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { isTrialActive, trialDaysLeft, hasTrialStarted, isTrialExpired } from '../utils/trial';
import {
  getPremiumMode,
  isAiFeatureEnabled,
  isMonetizationEnabled,
} from '@shared/config/runtimeConfig';

export function useSubscription() {
  const isPaidPro = useSubscriptionStore(s => s.isPro);

  const trialActive = isTrialActive();
  const daysLeft = trialDaysLeft();
  const trialStarted = hasTrialStarted();
  const trialExpired = isTrialExpired();
  const premiumMode = getPremiumMode();
  const monetizationEnabled = isMonetizationEnabled();
  const featuresUnlocked = premiumMode === 'unlocked';

  const effectivePro = featuresUnlocked || (monetizationEnabled && (isPaidPro || trialActive));
  const aiAccess = isAiFeatureEnabled() && effectivePro;

  return {
    isPro: effectivePro,
    isPaidPro,
    isTrialActive: trialActive,
    trialDaysLeft: daysLeft,
    hasTrialStarted: trialStarted,
    isTrialExpired: trialExpired,
    isMonetizationEnabled: monetizationEnabled,
    premiumMode,
    canAddPet: (currentCount: number) => effectivePro || currentCount < 1,
    canExportPDF: () => effectivePro,
    canAccessAdvanced: () => aiAccess,
    canAccessUnlimitedHistory: () => effectivePro,
  };
}
