import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = '670088531880-qa4iau47becj5ptho1dvfubd4pknnn27.apps.googleusercontent.com';

let configured = false;

export function configureGoogleSignIn() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string | null;
  photo: string | null;
  idToken: string | null;
}

export async function signInWithGoogle(): Promise<GoogleUser> {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  const data = response.data;
  if (!data?.user) throw new Error('Sign-in cancelled or failed');
  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    photo: data.user.photo,
    idToken: data.idToken ?? null,
  };
}

export async function signOutGoogle(): Promise<void> {
  // configure() is inside the try on purpose: sign-out must never be able to
  // throw. An email-provider user on a device without Google services has no
  // Google session to drop, and a throw here used to abort the whole signOut
  // flow before Firebase sign-out and state clearing (authStore).
  try {
    configureGoogleSignIn();
    await GoogleSignin.signOut();
  } catch {
    // Already signed out, or Google services unavailable
  }
}

export async function silentSignIn(): Promise<GoogleUser | null> {
  configureGoogleSignIn();
  try {
    const response = await GoogleSignin.signInSilently();
    const data = response.data;
    if (!data?.user) return null;
    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      photo: data.user.photo,
      idToken: data.idToken ?? null,
    };
  } catch (error: unknown) {
    const code =
      error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : '';
    if (code === statusCodes.SIGN_IN_REQUIRED) return null;
    return null;
  }
}
