import {Platform} from 'react-native';

/** Convex deployment the native app talks to. */
export const CONVEX_URL = 'https://greedy-parakeet-883.convex.cloud';

/**
 * RevenueCat public SDK keys, one per store.
 *
 * These are publishable keys and are safe to ship and to commit, but they are
 * account specific. They are still null because no Obligio project exists in
 * RevenueCat yet — create one, add the iOS and Android apps, then copy each
 * app's public SDK key from Project settings > Apps. See docs/release.md.
 *
 * While a key is null the app runs with billing disabled: the paywall reports
 * that plans are unavailable rather than configuring the SDK with a bad key
 * and crashing on first use.
 */
const REVENUECAT_KEYS: {ios: string | null; android: string | null} = {
  ios: null,
  android: null,
};

export const revenueCatApiKey: string | null =
  Platform.OS === 'ios'
    ? REVENUECAT_KEYS.ios
    : Platform.OS === 'android'
      ? REVENUECAT_KEYS.android
      : null;
