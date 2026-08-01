import { create } from 'zustand';
import { getStorage, StorageKeys } from '@storage/mmkv/storage';
import { GoogleUser, signInWithGoogle, signOutGoogle, silentSignIn } from '../utils/googleAuth';
import {
  firebaseSignInWithGoogle,
  firebaseSignInWithEmail,
  firebaseSignUpWithEmail,
  firebaseSendPasswordReset,
  firebaseSignOutUser,
  firebaseDeleteAccount,
  awaitFirebaseAuthReady,
} from '../utils/firebaseConfig';
import { deleteCloudBackup } from '../utils/cloudBackup';

/** How the current user authenticated. Google is unavailable in some regions
 *  (e.g. Russia), so email/password is offered as a Google-free alternative. */
export type AuthProvider = 'google' | 'email';

/** Unified signed-in user. Email accounts have no name/photo/idToken. */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  photo: string | null;
  idToken: string | null;
  provider: AuthProvider;
}

function googleToAuthUser(u: GoogleUser): AuthUser {
  return { ...u, provider: 'google' };
}

interface AuthState {
  user: AuthUser | null;
  /** Firebase Auth UID (used for Firestore access) */
  firebaseUid: string | null;
  loading: boolean;
  /** Try to restore session silently on app start */
  restoreSession: () => Promise<void>;
  /** Interactive Google Sign-In */
  signIn: () => Promise<void>;
  /** Email + password sign-in (existing account) */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Email + password registration (new account) */
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  /** Send a password-reset email */
  resetPassword: (email: string) => Promise<void>;
  /** Sign out and clear stored user */
  signOut: () => Promise<void>;
  /** Permanently delete the account and its cloud backup (Google Play requirement) */
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  firebaseUid: null,
  loading: false,

  restoreSession: async () => {
    set({ loading: true });
    const storage = getStorage();
    try {
      // First check MMKV for cached user (drives UI immediately)
      const cached = storage.getString(StorageKeys.AUTH_USER);
      let cachedUser: AuthUser | null = null;
      if (cached) {
        try {
          cachedUser = JSON.parse(cached) as AuthUser;
          // Back-compat: pre-email caches have no `provider` — treat as Google.
          if (!cachedUser.provider) cachedUser.provider = 'google';
          set({ user: cachedUser });
        } catch {
          /* corrupted cache */
        }
      }

      if (cachedUser?.provider === 'email') {
        // Email sessions are restored from Firebase's own persisted state
        // (there is no password to silently re-auth with).
        const uid = await awaitFirebaseAuthReady();
        if (uid) {
          set({ firebaseUid: uid });
        } else {
          // Session revoked/expired (password change, account disabled, token
          // revoke). We can't silently re-auth an email account, so drop the
          // stale cache — otherwise the UI shows a "signed in" user whose backup
          // silently fails and there's no way back to the sign-in form.
          set({ user: null, firebaseUid: null });
          storage.delete(StorageKeys.AUTH_USER);
        }
        return;
      }

      // Google path: silent sign-in refreshes the token, then Firebase re-auths.
      const user = await silentSignIn();
      if (user) {
        const authUser = googleToAuthUser(user);
        set({ user: authUser });
        storage.set(StorageKeys.AUTH_USER, JSON.stringify(authUser));
        // Authenticate with Firebase for Firestore access
        if (user.idToken) {
          const uid = await firebaseSignInWithGoogle(user.idToken);
          set({ firebaseUid: uid });
        }
      } else if (cachedUser) {
        // Google silent sign-in failed transiently (Play Services hiccup, no
        // network), but Firebase may still hold a valid persisted session for
        // the same account — recover the uid so cloud backup keeps working.
        const uid = await awaitFirebaseAuthReady();
        if (uid) set({ firebaseUid: uid });
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
      const authUser = googleToAuthUser(user);
      set({ user: authUser });
      const storage = getStorage();
      storage.set(StorageKeys.AUTH_USER, JSON.stringify(authUser));
      // Authenticate with Firebase for Firestore access
      if (user.idToken) {
        const uid = await firebaseSignInWithGoogle(user.idToken);
        set({ firebaseUid: uid });
      }
    } finally {
      set({ loading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    try {
      const { uid, email: mail } = await firebaseSignInWithEmail(email, password);
      const authUser: AuthUser = {
        id: uid,
        email: mail,
        name: null,
        photo: null,
        idToken: null,
        provider: 'email',
      };
      set({ user: authUser, firebaseUid: uid });
      getStorage().set(StorageKeys.AUTH_USER, JSON.stringify(authUser));
    } finally {
      set({ loading: false });
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ loading: true });
    try {
      const { uid, email: mail } = await firebaseSignUpWithEmail(email, password);
      const authUser: AuthUser = {
        id: uid,
        email: mail,
        name: null,
        photo: null,
        idToken: null,
        provider: 'email',
      };
      set({ user: authUser, firebaseUid: uid });
      getStorage().set(StorageKeys.AUTH_USER, JSON.stringify(authUser));
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    await firebaseSendPasswordReset(email);
  },

  signOut: async () => {
    set({ loading: true });
    try {
      // Clear local session FIRST. Both provider sign-outs swallow their own
      // errors, but the order still mattered: anything unexpected thrown while
      // talking to Google (no Play services on the device — the RuStore
      // audience) left an email user shown as signed in with no way out.
      set({ user: null, firebaseUid: null });
      getStorage().delete(StorageKeys.AUTH_USER);
      await firebaseSignOutUser();
      await signOutGoogle();
    } finally {
      set({ loading: false });
    }
  },

  deleteAccount: async () => {
    set({ loading: true });
    try {
      const uid = useAuthStore.getState().firebaseUid;
      // Cloud data first: if the auth user were deleted first, its Firestore
      // rules access would be gone and the backup would be orphaned forever.
      if (uid) await deleteCloudBackup(uid);
      // May throw REAUTH_REQUIRED — deliberately propagated so the UI can ask
      // the user to sign in again. Local session is left intact in that case,
      // otherwise they would be signed out with the account still alive.
      await firebaseDeleteAccount();
      set({ user: null, firebaseUid: null });
      getStorage().delete(StorageKeys.AUTH_USER);
      await signOutGoogle();
    } finally {
      set({ loading: false });
    }
  },
}));
