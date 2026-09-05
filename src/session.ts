import {useCallback, useEffect, useState} from 'react';
import {authBridge} from './nativeAuth';
import {refreshConvexAuth} from './convexClient';

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
  signOut: () => Promise<void>;
  clearError: () => void;
};

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

/**
 * Tracks the native Clerk session and keeps Convex's auth in step with it.
 *
 * The bridge fails closed: when the native module is absent the status is
 * `unavailable` rather than `signed-out`, so the UI can say the build cannot
 * authenticate instead of offering a sign-in button that could never work.
 */
export function useSession(): Session {
  const [status, setStatus] = useState<SessionStatus>(authBridge.available ? 'checking' : 'unavailable');
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

  return {status, error, signIn, signOut, clearError};
}
