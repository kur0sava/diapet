import { useSubscriptionStore, isBackendConfigured } from '@shared/stores/subscriptionStore';

export function useSubscription() {
  const isPro = useSubscriptionStore(s => s.isPro);

  // Bypass paywall only in dev when backend is not configured.
  // In production builds, missing credentials must NOT grant Pro.
  const effectivePro = isPro || (__DEV__ && !isBackendConfigured());

  return {
    isPro: effectivePro,
    canAddPet: (currentCount: number) => effectivePro || currentCount < 1,
    canExportPDF: () => effectivePro,
    canAccessAdvanced: () => effectivePro,
    canAccessUnlimitedHistory: () => effectivePro,
  };
}
