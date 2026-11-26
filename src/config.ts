import { Platform } from 'react-native';

/** Convex deployment the native app talks to. */
export const CONVEX_URL = 'https://greedy-parakeet-883.convex.cloud';

/**
 * RevenueCat public SDK keys, one per store.
 *
 * These are publishable keys, meant to ship inside the app binary, so they are
 * safe to commit. They are per-store and per-project. A null key disables
 * billing on that platform: the paywall reports that plans are unavailable
 * rather than configuring the SDK with a bad key and crashing on first use.
 */
const REVENUECAT_KEYS: { ios: string | null; android: string | null } = {
  // RevenueCat project Obligio, app "Obligio (App Store)" (app3b3ac2cefb).
  ios: 'appl_SIBIzGDFokrIPHVzuFUEEaDSbLl',
  // RevenueCat project Obligio, app "Obligio (Play Store)" (app6413bd9f3e).
  android: 'goog_joeqthkYcqpkIIwTHgTAPyWmFPT',
};

export const revenueCatApiKey: string | null =
  Platform.OS === 'ios'
    ? REVENUECAT_KEYS.ios
    : Platform.OS === 'android'
    ? REVENUECAT_KEYS.android
    : null;

/**
 * Krontelli, our own push server, and GlitchTip, our own error server.
 *
 * Both ship inside the binary and neither is a secret: the public key can only
 * register an installation and the DSN can only submit an error report. Sending
 * needs the server key, which never touches this repository.
 */
export const KRONTELLI_PUBLIC_KEY: string | null =
  'kt_pub_tDPhMbZiF-bYlCZOPERVhtGv35qbYAGM';
export const GLITCHTIP_DSN: string | null =
  'https://0a0398f8561c4ad0a4eb9568b2327718@errors.krontelli.com/11';

/**
 * Public pages the app links out to.
 *
 * These are the same URLs declared in `fastlane/metadata/en-US/*_url.txt`, so
 * what the store listing promises and what Settings opens stay the same page.
 */
export const PRIVACY_URL = 'https://obligio.com/privacy';
export const SUPPORT_URL = 'https://obligio.com/support';
