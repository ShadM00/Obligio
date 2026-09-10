# Obligio native authentication bridge

Obligio remains a React Native CLI application. Clerk does not publish a
React Native CLI package, so the app uses a narrow native module contract rather
than an Expo dependency.

The module is named `ObligioAuth` and exposes:

- `getToken(forceRefresh)` — requests a short-lived Clerk session JWT or `null`; forced refresh bypasses the SDK token cache.
- `signIn()` — starts Clerk hosted authentication on iOS (`startHostedAuth`). On Android it presents Clerk's prebuilt Compose flow (`AuthView`) in `ClerkSignInActivity` and resolves when that activity finishes; the Android SDK has no one-call hosted equivalent. Backing out resolves rather than rejects, so a cancelled sign-in returns to the welcome screen without an error banner.
- `signOut()` — clears the active Clerk session.
- `isSignedIn()` — reports whether a valid session is active.

`src/convexClient.ts` passes the token directly to Convex with `setAuth`.
Tokens are not persisted by JavaScript and secret keys never ship in the app.

Platform implementation requirements:

- Android: initialize Clerk with the production publishable key and expose the
  session token through a Kotlin React Native native module.
- iOS: initialize ClerkKit with the production publishable key and expose the
  session token through a Swift/Objective-C React Native native module.
- Register each native application in Clerk production before release builds.

The module deliberately fails closed when absent: authenticated Convex calls
receive no token rather than falling back to the former development owner token.

## Verification status

Android token retrieval now uses `Clerk.auth.getToken` instead of reading a cached JWT. Sign-out calls `Clerk.auth.signOut` and propagates failures. Session queries wait for SDK initialization with a bounded timeout. iOS exports the Swift methods through an Objective-C++ registration file and initializes Clerk at launch. Both platforms accept the forced-refresh flag from Convex.

Native compilation and JS bridge contract tests do not prove live authentication. Remaining checks include Android sign-in UI, native application registrations, session restoration, signed-in app gating, Convex token audience verification, device login/logout/refresh, and failure recovery. No end-to-end authentication completion is claimed.
