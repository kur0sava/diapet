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

  // C1 (audit): gate the free-tier LIMITS on billing mode only. Previously
  // `hidden` (monetization off, no paywall) still evaluated effectivePro=false,
  // so canAddPet/canExportPDF/unlimited-history were locked behind a purchase
  // that cannot be made — a dead end. Any build without an explicit
  // extra.premiumMode defaults to 'hidden', so this also protected dev runs.
  // Now: not-billing (hidden OR unlocked) → everything available; billing →
  // real gating by purchase/trial. AI stays separately gated via isAiFeature*.
  const effectivePro = !monetizationEnabled || isPaidPro || trialActive;
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
