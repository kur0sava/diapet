import { useSubscriptionStore } from '@shared/stores/subscriptionStore';

export function useSubscription() {
  const isPro = useSubscriptionStore(s => s.isPro);

  return {
    isPro,
    canAddPet: (currentCount: number) => isPro || currentCount < 1,
    canExportPDF: () => isPro,
    canAccessAdvanced: () => isPro,
    canAccessUnlimitedHistory: () => isPro,
  };
}
