import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  inMemoryPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDarguVirBK5I3W35McnSQ4o1sRIe0KA2o',
  authDomain: 'diapet-49162.firebaseapp.com',
  projectId: 'diapet-49162',
  storageBucket: 'diapet-49162.firebasestorage.app',
  messagingSenderId: '670088531880',
  appId: '1:670088531880:android:2e0c8485104079e33a179d',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase Auth — in-memory persistence (session restored via Google silentSignIn + MMKV cache)
const auth = (() => {
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    // Already initialized (hot reload) — use existing instance
    return getAuth(app);
  }
})();

export { auth };
export const db = getFirestore(app);

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
 * Sign out from Firebase Auth.
 */
export async function firebaseSignOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // Already signed out
  }
}
