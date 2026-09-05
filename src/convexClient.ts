import {ConvexReactClient} from 'convex/react';
import {authBridge} from './nativeAuth';
import {CONVEX_URL} from './config';

export const convexUrl = CONVEX_URL;
export const convexClient = new ConvexReactClient(convexUrl);

// Convex requests receive short-lived Clerk session JWTs from the native
// bridge. The client never stores or handles a Clerk secret key.
convexClient.setAuth(async ({forceRefreshToken}) => {
  if (authBridge.available) return authBridge.getToken(forceRefreshToken);
  return null;
});
