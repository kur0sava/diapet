import { useMemo } from 'react';
import { usePetStore } from '@shared/stores/petStore';
import { getSpeciesConfig, type SpeciesConfig } from '@shared/config/speciesConfig';

/**
 * Returns the species config for the currently active pet.
 * Falls back to cat config if no active pet.
 */
export function useSpeciesConfig(): SpeciesConfig {
  const activePet = usePetStore(s => s.activePet);
  return useMemo(() => getSpeciesConfig(activePet?.species ?? 'cat'), [activePet?.species]);
}
