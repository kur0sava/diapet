import { create } from 'zustand';

export type HintCategory = 'practical' | 'medical_fact' | 'support';

type Hint = { text: string; category: HintCategory; id: string };

interface HintState {
  currentHint: Hint | null;
  pendingHint: Hint | null;
  showAchievement: boolean;
}

interface HintActions {
  showHint: (hint: Hint) => void;
  dismissHint: () => void;
  triggerAchievement: () => void;
  dismissAchievement: () => void;
}

export const useHintStore = create<HintState & HintActions>((set, get) => ({
  currentHint: null,
  pendingHint: null,
  showAchievement: false,
  showHint: hint => {
    if (get().currentHint) {
      set({ pendingHint: hint });
    } else {
      set({ currentHint: hint });
    }
  },
  dismissHint: () => {
    const pending = get().pendingHint;
    set({ currentHint: pending, pendingHint: null });
  },
  triggerAchievement: () => set({ showAchievement: true }),
  dismissAchievement: () => set({ showAchievement: false }),
}));
