import { create } from 'zustand';
import { Pet } from '@storage/domain/types';
import { petRepository } from '@storage/database';
import { storage, StorageKeys } from '@storage/mmkv/storage';

interface PetStore {
  activePet: Pet | null;
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  loadPets: () => Promise<void>;
  setActivePet: (pet: Pet) => void;
  refreshActivePet: () => Promise<void>;
}

export const usePetStore = create<PetStore>((set, get) => ({
  activePet: null,
  pets: [],
  isLoading: false,
  error: null,

  loadPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const pets = await petRepository.findActive();
      const activePetId = storage.getString(StorageKeys.ACTIVE_PET_ID);
      const activePet = activePetId
        ? pets.find(p => p.id === activePetId) ?? pets[0] ?? null
        : pets[0] ?? null;
      set({ pets, activePet, isLoading: false });
    } catch (error) {
      console.error('Failed to load pets:', error);
      set({ isLoading: false, error: 'Failed to load pets' });
    }
  },

  setActivePet: (pet: Pet) => {
    storage.set(StorageKeys.ACTIVE_PET_ID, pet.id);
    set({ activePet: pet });
  },

  refreshActivePet: async () => {
    const { activePet } = get();
    if (!activePet) return;
    const updated = await petRepository.findById(activePet.id);
    if (updated) set({ activePet: updated });
  },
}));
