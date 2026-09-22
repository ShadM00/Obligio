import { useCallback, useEffect, useState } from 'react';
import { authBridge } from './nativeAuth';
import { refreshConvexAuth } from './convexClient';

export type SessionStatus =
  /** Asking the native bridge whether a session exists. */
  | 'checking'
  /** No native Clerk module in this build, so signing in is impossible. */
  | 'unavailable'
  | 'signed-out'
  | 'signed-in';

export type Session = {
  status: SessionStatus;
  error: string | null;
  signIn: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  /** Whether to offer the Apple button beside the hosted sign-in. */
  appleAvailable: boolean;
  signOut: () => Promise<void>;
  clearError: () => void;
};

function isCancellation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'CLERK_SIGN_IN_CANCELLED'
  );
}

function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Authentication failed. Please try again.';
}

/**
 * Tracks the native Clerk session and keeps Convex's auth in step with it.
 *
 * The bridge fails closed: when the native module is absent the status is
 * `unavailable` rather than `signed-out`, so the UI can say the build cannot
 * authenticate instead of offering a sign-in button that could never work.
 */
export function useSession(): Session {
  const [status, setStatus] = useState<SessionStatus>(
    authBridge.available ? 'checking' : 'unavailable',
  );
  const [error, setError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    if (!authBridge.available) {
      setStatus('unavailable');
      return;
    }
    try {
      const signedIn = await authBridge.isSignedIn();
      setStatus(signedIn ? 'signed-in' : 'signed-out');
    } catch (err) {
      setError(message(err));
      setStatus('signed-out');
    }
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await authBridge.signIn();
      refreshConvexAuth();
      await sync();
    } catch (err) {
      setError(message(err));
      await sync();
    }
  }, [sync]);

  const signInWithApple = useCallback(async () => {
    setError(null);
    try {
      await authBridge.signInWithApple();
      refreshConvexAuth();
      await sync();
    } catch (err) {
      // A cancelled Apple sheet is the user changing their mind, not a
      // failure worth a banner.
      if (!isCancellation(err)) setError(message(err));
      await sync();
    }
  }, [sync]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authBridge.signOut();
    } catch (err) {
      // Surface the failure but still resynchronise: a partially completed
      // sign-out must not leave the UI claiming the user is signed in.
      setError(message(err));
    } finally {
      refreshConvexAuth();
      await sync();
    }
  }, [sync]);

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    error,
    signIn,
    signInWithApple,
    appleAvailable: authBridge.appleAvailable,
    signOut,
    clearError,
  };
}
