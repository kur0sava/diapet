import { useSubscriptionStore, isBackendConfigured } from '@shared/stores/subscriptionStore';

export function useSubscription() {
  const isPro = useSubscriptionStore(s => s.isPro);

  // If backend is not configured (no Supabase URL), grant all features
  // so users are not blocked by a broken paywall during development.
  const effectivePro = isPro || !isBackendConfigured();

  return {
    isPro: effectivePro,
    canAddPet: (currentCount: number) => effectivePro || currentCount < 1,
    canExportPDF: () => effectivePro,
    canAccessAdvanced: () => effectivePro,
    canAccessUnlimitedHistory: () => effectivePro,
  };
}
