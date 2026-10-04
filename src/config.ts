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
 * OneSignal app id for push notifications.
 *
 * An app id identifies the app to OneSignal and ships inside the binary; it is
 * not a secret and cannot send anything by itself (sending needs the REST API
 * key, which never touches this repository). The APNs key and the FCM service
 * account that deliver the pushes are uploaded to OneSignal, not kept here.
 * Dashboard app "Obligio", Royal Nation LLC.
 */
export const ONESIGNAL_APP_ID: string | null =
  'c47bc000-7f1e-42f5-aa7c-ee57b75c8a89';

/**
 * Public pages the app links out to.
 *
 * These are the same URLs declared in `fastlane/metadata/en-US/*_url.txt`, so
 * what the store listing promises and what Settings opens stay the same page.
 */
export const PRIVACY_URL = 'https://obligio.com/privacy';
export const SUPPORT_URL = 'https://obligio.com/support';
