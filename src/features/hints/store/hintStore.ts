import { create } from 'zustand';

export type HintCategory = 'practical' | 'medical_fact' | 'support';

type Hint = {
  text: string;
  category: HintCategory;
  id: string;
  /** Optional encyclopedia article id — renders a "Подробнее" link on the hint
   *  card that deep-links to it. Must be species-safe for the hint's audience. */
  articleId?: string;
};

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
  /** v2.6: achievements are id-based (see data/achievements). Several can
   * unlock from one save (e.g. streak_7 + glucose_50) — queue them so the
   * modal shows one at a time on dismiss. */
  currentAchievementId: string | null;
  pendingAchievements: string[];
}

interface HintActions {
  showHint: (hint: Hint) => void;
  dismissHint: () => void;
  showAchievementById: (id: string) => void;
  dismissAchievement: () => void;
}

export const useHintStore = create<HintState & HintActions>((set, get) => ({
  currentHint: null,
  pendingHints: [],
  currentAchievementId: null,
  pendingAchievements: [],
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
  showAchievementById: id => {
    const { currentAchievementId, pendingAchievements } = get();
    if (currentAchievementId === id || pendingAchievements.includes(id)) return;
    if (currentAchievementId) {
      set({ pendingAchievements: [...pendingAchievements, id] });
    } else {
      set({ currentAchievementId: id });
    }
  },
  dismissAchievement: () => {
    const queue = get().pendingAchievements;
    if (queue.length === 0) {
      set({ currentAchievementId: null });
    } else {
      const [next, ...rest] = queue;
      set({ currentAchievementId: next, pendingAchievements: rest });
    }
  },
}));
