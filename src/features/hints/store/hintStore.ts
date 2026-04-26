import { create } from 'zustand';

export type HintCategory = 'practical' | 'medical_fact' | 'support';

type Hint = { text: string; category: HintCategory; id: string };

/**
 * BUG-M008 (audit): pending was a single slot — when morningGreeting,
 * missedInjection, and a regular hint trigger near-simultaneously the third
 * one would silently overwrite the second. Using a small queue preserves
 * up to 5 hints; anything beyond that is rare enough to drop intentionally
 * (avoids unbounded growth if a bug ever fires hints in a tight loop).
 */
const PENDING_QUEUE_LIMIT = 5;

interface HintState {
  currentHint: Hint | null;
  pendingHints: Hint[];
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
  pendingHints: [],
  showAchievement: false,
  showHint: hint => {
    if (get().currentHint) {
      const queue = get().pendingHints;
      // Skip duplicates (same id already queued or showing) — repeated
      // triggers from rapid re-renders shouldn't multiply the same toast.
      if (get().currentHint?.id === hint.id || queue.some(h => h.id === hint.id)) return;
      if (queue.length >= PENDING_QUEUE_LIMIT) return;
      set({ pendingHints: [...queue, hint] });
    } else {
      set({ currentHint: hint });
    }
  },
  dismissHint: () => {
    const queue = get().pendingHints;
    if (queue.length === 0) {
      set({ currentHint: null });
    } else {
      const [next, ...rest] = queue;
      set({ currentHint: next, pendingHints: rest });
    }
  },
  triggerAchievement: () => set({ showAchievement: true }),
  dismissAchievement: () => set({ showAchievement: false }),
}));
