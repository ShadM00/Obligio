import {Platform} from 'react-native';

/** Convex deployment the native app talks to. */
export const CONVEX_URL = 'https://greedy-parakeet-883.convex.cloud';

/**
 * RevenueCat public SDK keys, one per store.
 *
 * These are publishable keys, meant to ship inside the app binary, so they are
 * safe to commit. They are per-store and per-project.
 *
 * Android is still null: a Play Store app configuration in RevenueCat requires
 * Play service-account credentials, which do not exist yet. Until it is set,
 * Android runs with billing disabled — the paywall reports that plans are
 * unavailable rather than configuring the SDK with a bad key and crashing on
 * first use. See docs/release.md.
 */
const REVENUECAT_KEYS: {ios: string | null; android: string | null} = {
  // RevenueCat project Obligio, app "Obligio (App Store)" (app3b3ac2cefb).
  ios: 'appl_SIBIzGDFokrIPHVzuFUEEaDSbLl',
  android: null,
};

export const revenueCatApiKey: string | null =
  Platform.OS === 'ios'
    ? REVENUECAT_KEYS.ios
    : Platform.OS === 'android'
      ? REVENUECAT_KEYS.android
      : null;
