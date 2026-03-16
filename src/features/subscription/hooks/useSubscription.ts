import { useSubscriptionStore } from '@shared/stores/subscriptionStore';
import { isPurchasesConfigured } from '@shared/stores/subscriptionStore';

export function useSubscription() {
  const isPro = useSubscriptionStore(s => s.isPro);

  // If RevenueCat is not configured (placeholder key), grant all features
  // so users are not blocked by a broken paywall.
  const effectivePro = isPro || !isPurchasesConfigured();

  return {
    isPro: effectivePro,
    canAddPet: (currentCount: number) => effectivePro || currentCount < 1,
    canExportPDF: () => effectivePro,
    canAccessAdvanced: () => effectivePro,
    canAccessUnlimitedHistory: () => effectivePro,
  };
}
