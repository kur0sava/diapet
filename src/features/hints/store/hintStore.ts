import { create } from 'zustand';

export type HintCategory = 'practical' | 'medical_fact' | 'support';

interface HintState {
  currentHint: { text: string; category: HintCategory; id: string } | null;
  showAchievement: boolean;
}

interface HintActions {
  showHint: (hint: { text: string; category: HintCategory; id: string }) => void;
  dismissHint: () => void;
  triggerAchievement: () => void;
  dismissAchievement: () => void;
}

export const useHintStore = create<HintState & HintActions>((set) => ({
  currentHint: null,
  showAchievement: false,
  showHint: (hint) => set({ currentHint: hint }),
  dismissHint: () => set({ currentHint: null }),
  triggerAchievement: () => set({ showAchievement: true }),
  dismissAchievement: () => set({ showAchievement: false }),
}));
