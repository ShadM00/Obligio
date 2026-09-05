import {ConvexReactClient} from 'convex/react';
import {authBridge} from './nativeAuth';
import {CONVEX_URL} from './config';

export const convexUrl = CONVEX_URL;
export const convexClient = new ConvexReactClient(convexUrl);

// Convex requests receive short-lived Clerk session JWTs from the native
// bridge. The client never stores or handles a Clerk secret key.
async function fetchToken({forceRefreshToken}: {forceRefreshToken: boolean}) {
  if (!authBridge.available) return null;
  return authBridge.getToken(forceRefreshToken);
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
