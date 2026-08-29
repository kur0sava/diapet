/**
 * Login-path scenarios for the auth store: email/password (Google-free path for
 * regions without Google Sign-In) and the existing Google flow. The Firebase and
 * Google SDK layers are mocked; MMKV persistence runs for real (in-memory mock),
 * so cache read/write and provider branching are exercised end-to-end.
 */
import { initStorage, getStorage, StorageKeys } from '@storage/mmkv/storage';
import { __resetAllMmkvStores } from '../test/mocks/mmkvMock';

jest.mock('@features/auth/utils/firebaseConfig', () => ({
  firebaseSignInWithGoogle: jest.fn(),
  firebaseSignInWithEmail: jest.fn(),
  firebaseSignUpWithEmail: jest.fn(),
  firebaseSendPasswordReset: jest.fn(),
  firebaseSignOutUser: jest.fn(),
  firebaseDeleteAccount: jest.fn(),
  awaitFirebaseAuthReady: jest.fn(),
  assertRecentLogin: jest.fn(),
  REAUTH_REQUIRED: 'REAUTH_REQUIRED',
  REAUTH_REQUIRED_BACKUP_GONE: 'REAUTH_REQUIRED_BACKUP_GONE',
}));
// cloudBackup pulls in firebase/firestore, which has no test double — the store
// only needs the one deletion call from it.
jest.mock('@features/auth/utils/cloudBackup', () => ({
  deleteCloudBackup: jest.fn(),
}));
jest.mock('@features/auth/utils/googleAuth', () => ({
  signInWithGoogle: jest.fn(),
  signOutGoogle: jest.fn(),
  silentSignIn: jest.fn(),
}));

import { useAuthStore } from '@features/auth/stores/authStore';
import * as fb from '@features/auth/utils/firebaseConfig';
import * as g from '@features/auth/utils/googleAuth';
import * as cb from '@features/auth/utils/cloudBackup';

const mockFb = fb as jest.Mocked<typeof fb>;
const mockG = g as jest.Mocked<typeof g>;
const mockCb = cb as jest.Mocked<typeof cb>;

const authErr = (code: string) => Object.assign(new Error(code), { code });
const readCache = () => {
  const raw = getStorage().getString(StorageKeys.AUTH_USER);
  return raw ? JSON.parse(raw) : null;
};

beforeAll(async () => {
  await initStorage();
});

beforeEach(() => {
  __resetAllMmkvStores();
  useAuthStore.setState({ user: null, firebaseUid: null, loading: false });
  jest.clearAllMocks();
  // Sensible default so unrelated branches never hang.
  mockG.signOutGoogle.mockResolvedValue(undefined);
  mockFb.firebaseSignOutUser.mockResolvedValue(undefined);
});

describe('email/password login', () => {
  it('signs up: sets email user, firebaseUid, persists cache with provider', async () => {
    mockFb.firebaseSignUpWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });

    await useAuthStore.getState().signUpWithEmail('a@b.com', 'secret1');

    const st = useAuthStore.getState();
    expect(st.user).toMatchObject({ id: 'u1', email: 'a@b.com', provider: 'email' });
    expect(st.user?.idToken).toBeNull();
    expect(st.firebaseUid).toBe('u1');
    expect(st.loading).toBe(false);
    expect(readCache()).toMatchObject({ id: 'u1', provider: 'email' });
  });

  it('signs in existing account and persists', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u2', email: 'c@d.com' });

    await useAuthStore.getState().signInWithEmail('c@d.com', 'secret1');

    const st = useAuthStore.getState();
    expect(st.user).toMatchObject({ id: 'u2', email: 'c@d.com', provider: 'email' });
    expect(st.firebaseUid).toBe('u2');
    expect(readCache().provider).toBe('email');
  });

  it('trims-agnostic: uses email returned by Firebase', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u2', email: 'canonical@d.com' });
    await useAuthStore.getState().signInWithEmail('  canonical@d.com ', 'secret1');
    expect(useAuthStore.getState().user?.email).toBe('canonical@d.com');
  });

  it('wrong credentials: rejects, resets loading, leaves user null and cache empty', async () => {
    mockFb.firebaseSignInWithEmail.mockRejectedValue(authErr('auth/invalid-credential'));

    await expect(useAuthStore.getState().signInWithEmail('a@b.com', 'wrong')).rejects.toMatchObject(
      { code: 'auth/invalid-credential' }
    );

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(st.loading).toBe(false);
    expect(readCache()).toBeNull();
  });

  it('email already in use on sign-up: propagates and does not sign in', async () => {
    mockFb.firebaseSignUpWithEmail.mockRejectedValue(authErr('auth/email-already-in-use'));

    await expect(
      useAuthStore.getState().signUpWithEmail('a@b.com', 'secret1')
    ).rejects.toMatchObject({ code: 'auth/email-already-in-use' });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('network failure: propagates and resets loading', async () => {
    mockFb.firebaseSignInWithEmail.mockRejectedValue(authErr('auth/network-request-failed'));
    await expect(
      useAuthStore.getState().signInWithEmail('a@b.com', 'secret1')
    ).rejects.toBeTruthy();
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('resetPassword forwards the email; failure propagates', async () => {
    mockFb.firebaseSendPasswordReset.mockResolvedValue(undefined);
    await useAuthStore.getState().resetPassword('a@b.com');
    expect(mockFb.firebaseSendPasswordReset).toHaveBeenCalledWith('a@b.com');

    mockFb.firebaseSendPasswordReset.mockRejectedValue(authErr('auth/user-not-found'));
    await expect(useAuthStore.getState().resetPassword('x@y.com')).rejects.toBeTruthy();
  });
});

describe('email session restore', () => {
  it('restores email session via awaitFirebaseAuthReady, never touches Google', async () => {
    getStorage().set(
      StorageKeys.AUTH_USER,
      JSON.stringify({
        id: 'u1',
        email: 'a@b.com',
        name: null,
        photo: null,
        idToken: null,
        provider: 'email',
      })
    );
    mockFb.awaitFirebaseAuthReady.mockResolvedValue('u1');

    await useAuthStore.getState().restoreSession();

    const st = useAuthStore.getState();
    expect(st.user?.provider).toBe('email');
    expect(st.firebaseUid).toBe('u1');
    expect(st.loading).toBe(false);
    expect(mockG.silentSignIn).not.toHaveBeenCalled();
    expect(mockFb.firebaseSignInWithGoogle).not.toHaveBeenCalled();
  });

  it('lost email session: clears stale cache so the sign-in form reappears', async () => {
    getStorage().set(
      StorageKeys.AUTH_USER,
      JSON.stringify({
        id: 'u1',
        email: 'a@b.com',
        name: null,
        photo: null,
        idToken: null,
        provider: 'email',
      })
    );
    mockFb.awaitFirebaseAuthReady.mockResolvedValue(null);

    await useAuthStore.getState().restoreSession();

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(readCache()).toBeNull();
    expect(st.loading).toBe(false);
  });
});

describe('google login', () => {
  it('signs in: sets google user, firebaseUid, persists cache with provider google', async () => {
    mockG.signInWithGoogle.mockResolvedValue({
      id: 'g1',
      email: 'g@b.com',
      name: 'Gina',
      photo: 'http://p',
      idToken: 'tok',
    });
    mockFb.firebaseSignInWithGoogle.mockResolvedValue('fbuid');

    await useAuthStore.getState().signIn();

    const st = useAuthStore.getState();
    expect(st.user).toMatchObject({ id: 'g1', email: 'g@b.com', name: 'Gina', provider: 'google' });
    expect(st.firebaseUid).toBe('fbuid');
    expect(readCache().provider).toBe('google');
    expect(mockFb.firebaseSignInWithGoogle).toHaveBeenCalledWith('tok');
  });

  it('cancelled sign-in: rejects and resets loading, user null', async () => {
    mockG.signInWithGoogle.mockRejectedValue(new Error('Sign-in cancelled or failed'));

    await expect(useAuthStore.getState().signIn()).rejects.toBeTruthy();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('restores via silentSignIn and re-auths Firebase', async () => {
    mockG.silentSignIn.mockResolvedValue({
      id: 'g1',
      email: 'g@b.com',
      name: 'Gina',
      photo: null,
      idToken: 'tok',
    });
    mockFb.firebaseSignInWithGoogle.mockResolvedValue('fbuid');

    await useAuthStore.getState().restoreSession();

    const st = useAuthStore.getState();
    expect(st.user?.provider).toBe('google');
    expect(st.firebaseUid).toBe('fbuid');
    expect(mockFb.awaitFirebaseAuthReady).not.toHaveBeenCalled();
  });

  it('back-compat: cached user without provider is treated as google', async () => {
    getStorage().set(
      StorageKeys.AUTH_USER,
      JSON.stringify({ id: 'g1', email: 'g@b.com', name: 'Gina', photo: null, idToken: 'old' })
    );
    mockG.silentSignIn.mockResolvedValue({
      id: 'g1',
      email: 'g@b.com',
      name: 'Gina',
      photo: null,
      idToken: 'tok',
    });
    mockFb.firebaseSignInWithGoogle.mockResolvedValue('fbuid');

    await useAuthStore.getState().restoreSession();

    expect(mockG.silentSignIn).toHaveBeenCalled();
    expect(mockFb.awaitFirebaseAuthReady).not.toHaveBeenCalled();
    expect(useAuthStore.getState().user?.provider).toBe('google');
    expect(useAuthStore.getState().firebaseUid).toBe('fbuid');
  });

  it('no cache and silent sign-in returns null: stays signed out', async () => {
    mockG.silentSignIn.mockResolvedValue(null);

    await useAuthStore.getState().restoreSession();

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(st.loading).toBe(false);
    // No cached user → no reason to probe the persisted Firebase session.
    expect(mockFb.awaitFirebaseAuthReady).not.toHaveBeenCalled();
  });

  it('silent sign-in null but cache present: recovers uid from persisted session', async () => {
    getStorage().set(
      StorageKeys.AUTH_USER,
      JSON.stringify({ id: 'g1', email: 'g@b.com', name: 'Gina', photo: null, idToken: 'old' })
    );
    mockG.silentSignIn.mockResolvedValue(null);
    mockFb.awaitFirebaseAuthReady.mockResolvedValue('fbuid');

    await useAuthStore.getState().restoreSession();

    const st = useAuthStore.getState();
    expect(st.user?.provider).toBe('google');
    expect(st.firebaseUid).toBe('fbuid');
    expect(mockFb.firebaseSignInWithGoogle).not.toHaveBeenCalled();
  });

  it('silent sign-in throws: swallowed, stays signed out, loading reset', async () => {
    mockG.silentSignIn.mockRejectedValue(new Error('network'));

    await expect(useAuthStore.getState().restoreSession()).resolves.toBeUndefined();
    expect(useAuthStore.getState().loading).toBe(false);
  });
});

describe('sign out and provider transitions', () => {
  it('signOut clears user, firebaseUid and cache for an email user', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');
    expect(readCache()).not.toBeNull();

    await useAuthStore.getState().signOut();

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(readCache()).toBeNull();
    expect(mockG.signOutGoogle).toHaveBeenCalled();
    expect(mockFb.firebaseSignOutUser).toHaveBeenCalled();
  });

  it('signOut clears the email session even if the Google sign-out throws', async () => {
    // Device without Google Play services (RuStore audience): anything thrown
    // on the Google path must not leave an email user shown as signed in with
    // no way back to the sign-in form.
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');
    mockG.signOutGoogle.mockRejectedValue(new Error('no play services'));

    await expect(useAuthStore.getState().signOut()).rejects.toThrow();

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(readCache()).toBeNull();
    expect(st.loading).toBe(false);
  });

  it('switching google -> email overwrites cached provider', async () => {
    mockG.signInWithGoogle.mockResolvedValue({
      id: 'g1',
      email: 'g@b.com',
      name: 'Gina',
      photo: null,
      idToken: 'tok',
    });
    mockFb.firebaseSignInWithGoogle.mockResolvedValue('fbuid');
    await useAuthStore.getState().signIn();
    expect(readCache().provider).toBe('google');

    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u9', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');

    expect(readCache().provider).toBe('email');
    expect(useAuthStore.getState().user?.id).toBe('u9');
    expect(useAuthStore.getState().firebaseUid).toBe('u9');
  });

  it('deleteAccount removes the cloud backup before the auth user, then clears the session', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');

    await useAuthStore.getState().deleteAccount();

    expect(mockCb.deleteCloudBackup).toHaveBeenCalledWith('u1');
    // Order matters: deleting the auth user first would strip Firestore access
    // and orphan the backup document forever.
    expect(mockCb.deleteCloudBackup.mock.invocationCallOrder[0]).toBeLessThan(
      mockFb.firebaseDeleteAccount.mock.invocationCallOrder[0]
    );

    const st = useAuthStore.getState();
    expect(st.user).toBeNull();
    expect(st.firebaseUid).toBeNull();
    expect(readCache()).toBeNull();
    expect(st.loading).toBe(false);
  });

  it('deleteAccount refuses a stale session BEFORE deleting the cloud backup', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');
    // Firebase rejects sensitive operations on an old session. Discovering that
    // only after the backup is gone destroys the user's only off-device copy
    // while telling them the deletion failed.
    mockFb.assertRecentLogin.mockImplementationOnce(() => {
      throw new Error('REAUTH_REQUIRED');
    });

    await expect(useAuthStore.getState().deleteAccount()).rejects.toThrow('REAUTH_REQUIRED');

    expect(mockCb.deleteCloudBackup).not.toHaveBeenCalled();
    expect(mockFb.firebaseDeleteAccount).not.toHaveBeenCalled();
    const st = useAuthStore.getState();
    expect(st.user?.id).toBe('u1');
    expect(st.firebaseUid).toBe('u1');
    expect(readCache()).not.toBeNull();
    expect(st.loading).toBe(false);
  });

  it('deleteAccount reports the backup as gone when Firebase refuses after the cleanup', async () => {
    mockFb.firebaseSignInWithEmail.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });
    await useAuthStore.getState().signInWithEmail('a@b.com', 'secret1');
    mockFb.firebaseDeleteAccount.mockRejectedValue(new Error('REAUTH_REQUIRED'));

    // The pre-flight passed, so the backup really is deleted by this point:
    // the error must say so rather than implying nothing happened.
    await expect(useAuthStore.getState().deleteAccount()).rejects.toThrow(
      'REAUTH_REQUIRED_BACKUP_GONE'
    );
    expect(mockCb.deleteCloudBackup).toHaveBeenCalledWith('u1');

    // Signing the user out here would leave them locked out of an account that
    // still exists, with no way to retry the deletion.
    const st = useAuthStore.getState();
    expect(st.user?.id).toBe('u1');
    expect(st.firebaseUid).toBe('u1');
    expect(readCache()).not.toBeNull();
    expect(st.loading).toBe(false);
  });
});
