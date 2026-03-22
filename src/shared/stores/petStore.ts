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
      // Persist auto-selected pet ID (or clear stale one)
      if (activePet) {
        storage.set(StorageKeys.ACTIVE_PET_ID, activePet.id);
      } else {
        storage.delete(StorageKeys.ACTIVE_PET_ID);
      }
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
    try {
      const updated = await petRepository.findById(activePet.id);
      if (updated) {
        const pets = get().pets.map(p => p.id === updated.id ? updated : p);
        set({ activePet: updated, pets });
      }
    } catch (error) {
      console.error('Failed to refresh active pet:', error);
    }
  },
}));
