import {Platform} from 'react-native';

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
const REVENUECAT_KEYS: {ios: string | null; android: string | null} = {
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
