import {ConvexReactClient} from 'convex/react';
import {authBridge} from './nativeAuth';

// Native release builds target the authenticated production deployment.
// Local development can override this through the generated build configuration.
export const convexUrl = 'https://greedy-parakeet-883.convex.cloud';
export const convexClient = new ConvexReactClient(convexUrl);

// Convex requests receive short-lived Clerk session JWTs from the native
// bridge. The client never stores or handles a Clerk secret key.
convexClient.setAuth(async ({forceRefreshToken}) => {
  if (authBridge.available) return authBridge.getToken(forceRefreshToken);
  return null;
});
