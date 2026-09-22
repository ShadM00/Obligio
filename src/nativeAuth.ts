import { NativeModules, Platform } from 'react-native';

type NativeAuth = {
  getToken: (forceRefresh: boolean) => Promise<string | null>;
  signIn: () => Promise<void>;
  signInWithApple?: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
};

const nativeAuth = NativeModules.ObligioAuth as NativeAuth | undefined;

export const authBridge = {
  available: Boolean(nativeAuth),
  platform: Platform.OS,
  /** Only iOS builds carry Sign in with Apple; Android offers Google instead. */
  appleAvailable:
    Platform.OS === 'ios' && typeof nativeAuth?.signInWithApple === 'function',
  getToken: async (forceRefresh = false) =>
    nativeAuth ? nativeAuth.getToken(forceRefresh) : null,
  signIn: async () => {
    if (!nativeAuth)
      throw new Error('Native Clerk authentication is not installed');
    await nativeAuth.signIn();
  },
  signInWithApple: async () => {
    if (!nativeAuth?.signInWithApple)
      throw new Error('Sign in with Apple is not available in this build');
    await nativeAuth.signInWithApple();
  },
  signOut: async () => {
    if (!nativeAuth)
      throw new Error('Native Clerk authentication is not installed');
    await nativeAuth.signOut();
  },
  isSignedIn: async () => (nativeAuth ? nativeAuth.isSignedIn() : false),
  deleteAccount: async () => {
    if (!nativeAuth)
      throw new Error('Native Clerk authentication is not installed');
    await nativeAuth.deleteAccount();
  },
};
