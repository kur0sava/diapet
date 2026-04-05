import { create } from 'zustand';
import { getStorage, StorageKeys } from '@storage/mmkv/storage';
import { GoogleUser, signInWithGoogle, signOutGoogle, silentSignIn } from '../utils/googleAuth';
import { firebaseSignInWithGoogle, firebaseSignOutUser } from '../utils/firebaseConfig';

interface AuthState {
  user: GoogleUser | null;
  /** Firebase Auth UID (used for Firestore access) */
  firebaseUid: string | null;
  loading: boolean;
  /** Try to restore session silently on app start */
  restoreSession: () => Promise<void>;
  /** Interactive Google Sign-In */
  signIn: () => Promise<void>;
  /** Sign out and clear stored user */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  firebaseUid: null,
  loading: false,

  restoreSession: async () => {
    set({ loading: true });
    const storage = getStorage();
    try {
      // First check MMKV for cached user
      const cached = storage.getString(StorageKeys.AUTH_USER);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as GoogleUser;
          set({ user: parsed });
        } catch {
          /* corrupted cache */
        }
      }
      // Then try silent sign-in to refresh token
      const user = await silentSignIn();
      if (user) {
        set({ user });
        storage.set(StorageKeys.AUTH_USER, JSON.stringify(user));
        // Authenticate with Firebase for Firestore access
        if (user.idToken) {
          const uid = await firebaseSignInWithGoogle(user.idToken);
          set({ firebaseUid: uid });
        }
      }
    } catch {
      // Not signed in — that's fine
    } finally {
      set({ loading: false });
    }
  },

  signIn: async () => {
    set({ loading: true });
    try {
      const user = await signInWithGoogle();
      set({ user });
      const storage = getStorage();
      storage.set(StorageKeys.AUTH_USER, JSON.stringify(user));
      // Authenticate with Firebase for Firestore access
      if (user.idToken) {
        const uid = await firebaseSignInWithGoogle(user.idToken);
        set({ firebaseUid: uid });
      }
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await signOutGoogle();
      await firebaseSignOutUser();
      set({ user: null, firebaseUid: null });
      const storage = getStorage();
      storage.delete(StorageKeys.AUTH_USER);
    } finally {
      set({ loading: false });
    }
  },
}));
