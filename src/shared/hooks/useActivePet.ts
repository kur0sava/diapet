import { useQuery } from '@tanstack/react-query';
import { petRepository } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';

export function useActivePet() {
  const activePetId = storage.getString(StorageKeys.ACTIVE_PET_ID);

  return useQuery({
    queryKey: ['pet', activePetId],
    queryFn: async () => {
      if (!activePetId) {
        const pets = await petRepository.findActive();
        return pets[0] ?? null;
      }
      return petRepository.findById(activePetId);
    },
    staleTime: 5 * 60 * 1000,
  });
}
