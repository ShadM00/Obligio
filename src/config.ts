import {Platform} from 'react-native';

/** Convex deployment the native app talks to. */
export const CONVEX_URL = 'https://greedy-parakeet-883.convex.cloud';

/**
 * RevenueCat public SDK keys, one per store.
 *
 * These are publishable keys and are safe to ship, but they are account
 * specific and must be filled in before a release build. While a key is null
 * the app runs with billing disabled: the paywall says plans are unavailable
 * instead of configuring the SDK with a bad key and crashing on first use.
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
