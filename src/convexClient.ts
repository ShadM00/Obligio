import {ConvexReactClient} from 'convex/react';
import {authBridge} from './nativeAuth';
import {CONVEX_URL} from './config';
import {recordError} from './analytics';
import {reportHandledError} from './errors';

export const convexUrl = CONVEX_URL;
export const convexClient = new ConvexReactClient(convexUrl);

// Convex requests receive short-lived Clerk session JWTs from the native
// bridge. The client never stores or handles a Clerk secret key.
//
// Convex wants null when there is no token. A rejection escapes Convex as an
// unhandled promise rejection, which is how iOS 1.4 reported "No session was
// found with id sess_…": Clerk refuses a token when the session saved on the
// device no longer exists on the server (iOS keeps the saved sign-in through a
// reinstall). Report the failure and carry on without a token, so Convex runs
// unauthenticated instead of throwing.
async function fetchToken({forceRefreshToken}: {forceRefreshToken: boolean}) {
  if (!authBridge.available) return null;
  try {
    return await authBridge.getToken(forceRefreshToken);
  } catch (error) {
    reportHandledError(error, 'convex-auth-token');
    recordError(error, 'convex-auth-token');
    return null;
  }
}

convexClient.setAuth(fetchToken);

/**
 * Re-runs the auth callback after the session changes.
 *
 * Convex caches the token it fetched at subscribe time, so a sign-in or
 * sign-out that happens afterwards is invisible until the callback is
 * reinstalled. Every session transition must call this or the app keeps
 * querying with the previous identity.
 */
export function refreshConvexAuth() {
  convexClient.setAuth(fetchToken);
}
