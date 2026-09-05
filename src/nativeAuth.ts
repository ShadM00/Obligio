import {NativeModules, Platform} from 'react-native';

type NativeAuth = {
  getToken: (forceRefresh: boolean) => Promise<string | null>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
};

const nativeAuth = NativeModules.ObligioAuth as NativeAuth | undefined;

export const authBridge = {
  available: Boolean(nativeAuth),
  platform: Platform.OS,
  getToken: async (forceRefresh = false) => (nativeAuth ? nativeAuth.getToken(forceRefresh) : null),
  signIn: async () => {
    if (!nativeAuth) throw new Error('Native Clerk authentication is not installed');
    await nativeAuth.signIn();
  },
  signOut: async () => {
    if (!nativeAuth) throw new Error('Native Clerk authentication is not installed');
    await nativeAuth.signOut();
  },
  isSignedIn: async () => (nativeAuth ? nativeAuth.isSignedIn() : false),
};
