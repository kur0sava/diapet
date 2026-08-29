import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as FirebaseAuth from 'firebase/auth';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  deleteUser,
} from 'firebase/auth';
import { getStorage, initStorage } from '@storage/mmkv/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDarguVirBK5I3W35McnSQ4o1sRIe0KA2o',
  authDomain: 'diapet-49162.firebaseapp.com',
  projectId: 'diapet-49162',
  storageBucket: 'diapet-49162.firebasestorage.app',
  messagingSenderId: '670088531880',
  appId: '1:670088531880:android:2e0c8485104079e33a179d',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * AsyncStorage-shaped adapter over our encrypted MMKV instance, so Firebase Auth
 * can persist the session across restarts. Google login re-authenticates every
 * launch via silentSignIn, but email/password login has no silent re-auth — the
 * only way to keep such a user signed in is Firebase's own persisted session.
 *
 * MMKV is synchronous; getStorage() throws until initStorage() finishes, so the
 * adapter degrades to "empty" instead of crashing if Firebase reads before the
 * storage ready-gate in App.tsx (real auth flows all happen well after it).
 */
const AUTH_PERSIST_PREFIX = 'fbauth:';
const mmkvAuthPersistence = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Await the storage ready-gate: firebaseConfig is imported during initial
      // bundle evaluation, before initStorage() finishes. Reading too early would
      // wrongly report "no session" and permanently drop a persisted email login.
      await initStorage();
      return getStorage().getString(AUTH_PERSIST_PREFIX + key) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await initStorage();
      getStorage().set(AUTH_PERSIST_PREFIX + key, value);
    } catch {
      /* storage unavailable */
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await initStorage();
      getStorage().delete(AUTH_PERSIST_PREFIX + key);
    } catch {
      /* storage unavailable */
    }
  },
};

// getReactNativePersistence is a named export of the React-Native build of
// firebase/auth (index.rn) but is absent from the default web type surface, so
// we reach it through the namespace with a cast instead of a named import.
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence: (storage: typeof mmkvAuthPersistence) => unknown;
  }
).getReactNativePersistence;

const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(mmkvAuthPersistence) as never,
    });
  } catch {
    // Already initialized (hot reload) — use existing instance
    return getAuth(app);
  }
})();

export { auth };
export const db = getFirestore(app);

export interface FirebaseEmailUser {
  uid: string;
  email: string;
}

/**
 * Sign in to Firebase Auth using Google ID token.
 * Returns the Firebase UID (different from Google account ID).
 */
export async function firebaseSignInWithGoogle(idToken: string): Promise<string> {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user.uid;
}

/**
 * Register a new account with email + password (Google-free path for regions
 * where Google Sign-In is unavailable). Returns the Firebase UID + email.
 */
export async function firebaseSignUpWithEmail(
  email: string,
  password: string
): Promise<FirebaseEmailUser> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return { uid: result.user.uid, email: result.user.email ?? email.trim() };
}

/** Sign in with an existing email + password account. */
export async function firebaseSignInWithEmail(
  email: string,
  password: string
): Promise<FirebaseEmailUser> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return { uid: result.user.uid, email: result.user.email ?? email.trim() };
}

/** Send a password-reset email. */
export async function firebaseSendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Resolve once Firebase has restored (or failed to restore) the persisted auth
 * state on cold start. Returns the current UID or null. Used to rehydrate an
 * email session, which — unlike Google — cannot be re-created without a password.
 */
export function awaitFirebaseAuthReady(timeoutMs = 4000): Promise<string | null> {
  return new Promise(resolve => {
    let settled = false;
    function finish(uid: string | null) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(uid);
    }
    // Guard against a spinner that never clears if the initial auth state never
    // arrives (e.g. persistence read wedged) — resolve as "no session" instead.
    // onAuthStateChanged never fires synchronously, so timer/unsubscribe are
    // always assigned before finish() runs.
    const timer = setTimeout(() => finish(null), timeoutMs);
    const unsubscribe = onAuthStateChanged(auth, u => finish(u ? u.uid : null));
  });
}

/**
 * Sign out from Firebase Auth.
 */
export async function firebaseSignOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Already signed out
  }
}

/** Thrown when Firebase refuses deletion until the user signs in again. */
export const REAUTH_REQUIRED = 'REAUTH_REQUIRED';

/**
 * Permanently delete the signed-in Firebase Auth user.
 *
 * Google Play requires apps that let users create an account to offer account
 * deletion from inside the app. Firebase guards deletion behind a recent login:
 * if the session is old it rejects with `auth/requires-recent-login`, which we
 * surface as REAUTH_REQUIRED so the UI can ask the user to sign in again rather
 * than showing a raw Firebase error.
 */
export async function firebaseDeleteAccount(): Promise<void> {
  const current = auth.currentUser;
  // No live Firebase session — happens when the UI was restored from the MMKV
  // cache while the silent sign-in failed (offline). Returning quietly here
  // would let the caller clear the session and report "account deleted" while
  // the account and its cloud backup are still very much alive. Signing in
  // again is exactly the remedy, so reuse that signal.
  if (!current) throw new Error(REAUTH_REQUIRED);
  try {
    await deleteUser(current);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'auth/requires-recent-login') throw new Error(REAUTH_REQUIRED);
    throw e;
  }
}

/**
 * Thrown when deletion failed for a stale session AFTER the cloud backup was
 * already removed. Distinct from REAUTH_REQUIRED because the user must be told
 * the truth: retrying will finish the job, but the backup is not coming back.
 */
export const REAUTH_REQUIRED_BACKUP_GONE = 'REAUTH_REQUIRED_BACKUP_GONE';

/** Firebase refuses sensitive operations on a session older than a few minutes.
 *  The exact window is not part of its public contract, so mirror it
 *  conservatively: guessing low only costs the user one extra sign-in, while
 *  guessing high costs them their cloud backup. */
const RECENT_LOGIN_WINDOW_MS = 5 * 60 * 1000;

/**
 * Pre-flight check for account deletion.
 *
 * MUST be called BEFORE any irreversible cleanup. Deleting the Firestore backup
 * has to happen first (once the auth user is gone, the client can no longer
 * satisfy the security rules and the document would be orphaned forever) — but
 * that ordering means a `requires-recent-login` rejection would otherwise
 * destroy the only off-device copy of the pet's history while telling the user
 * that nothing was deleted. Failing here instead leaves everything intact.
 */
export function assertRecentLogin(): void {
  const current = auth.currentUser;
  // No live session: the UI can be restored from the MMKV cache while the
  // silent sign-in failed (offline), and firebaseUid alone is not proof of one.
  if (!current) throw new Error(REAUTH_REQUIRED);
  const lastSignIn = current.metadata?.lastSignInTime;
  // No timestamp — let Firebase itself be the judge rather than blocking a
  // legitimate deletion.
  if (!lastSignIn) return;
  const age = Date.now() - new Date(lastSignIn).getTime();
  if (Number.isNaN(age) || age > RECENT_LOGIN_WINDOW_MS) throw new Error(REAUTH_REQUIRED);
}
