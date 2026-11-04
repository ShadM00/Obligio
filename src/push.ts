import Krontelli from '@krontelli/sdk-react-native';
import { createBarePlatform } from '@krontelli/sdk-react-native-bare';

import { initialLocale } from './i18n';
import { KRONTELLI_PUBLIC_KEY } from './config';
import { setKrontelliSink } from './krontelliEvents';

/**
 * Push notifications and usage events, through Krontelli, our own server.
 *
 * Krontelli also receives the app's two usage events (analytics.ts mirrors
 * every Firebase Analytics event here, with the same parameters) and its own
 * automatic app-open and session events (first_open, app_open, app_update,
 * session_start, push_received, push_opened), the same kind Firebase already
 * collects on its own. No consent step: the app has no analytics opt-out and
 * Firebase collects in every release build too.
 *
 * It deliberately does four things it could have done and doesn't:
 *
 * - It never asks for notification permission. The app already asks, through
 *   `prepareNotifications` in notifications.ts, when the owner sets up
 *   reminders; the permission is the operating system's single notification
 *   permission, so a push token is reported as soon as that is granted. A second
 *   prompt would be a second, worse moment to ask.
 * - It never calls `login`, so a device's push subscription is not tied to the
 *   Clerk account or any email. Pushes can be sent to everyone or to segments
 *   of devices, not to a named person.
 * - It sends no user content: event parameters are the fixed words and
 *   numbers analytics.ts sends to Firebase, never a title, name, email or date.
 * - It does nothing in debug builds, so a developer's simulator or phone never
 *   joins the production audience.
 *
 * Local deadline reminders (Notifee) are unaffected and keep working with no
 * network and no Krontelli.
 *
 * Like analytics, a failure here must never reach the user.
 */
let platform: ReturnType<typeof createBarePlatform> | null = null;

export function initPush(publicKey: string | null = KRONTELLI_PUBLIC_KEY): void {
  if (!publicKey || __DEV__ || platform) return;
  try {
    platform = createBarePlatform({
      androidChannel: {
        id: 'obligio-news',
        name: initialLocale() === 'fr-CA' ? 'Nouvelles et offres' : initialLocale() === 'es-US' ? 'Noticias y ofertas' : 'News and offers',
      },
    });
    // The SDK buffers events sent before init() finishes.
    setKrontelliSink({ track: (name, props) => Krontelli.track(name, props) });
    Krontelli.init({
      apiBaseUrl: 'https://api.krontelli.com',
      publicKey,
      requestPermissionOnInit: false,
      events: { automatic: true },
      platform,
    }).catch(() => undefined);
  } catch {
    // Push is best-effort.
    setKrontelliSink(null);
  }
}

/** Report the answer the reminder flow just got. The prompt was already answered, so nothing is shown. */
export function reportPushPermission(): void {
  if (__DEV__ || !platform) return;
  try {
    Krontelli.requestPermission().catch(() => undefined);
  } catch {
    // Push is best-effort.
  }
}

/**
 * The in-app opt-in to product news and offers. Apple's guideline 4.5.4 forbids
 * promotional pushes unless people explicitly agreed in the app's own UI, so
 * this is off until the owner turns it on in Settings, and a promotional message
 * must be sent as a `campaign`, which reaches only those who gave this consent.
 * Deadline reminders do not depend on it.
 */
const MARKETING_KEY = 'obligio.marketing_opt_in';

export async function marketingOptIn(): Promise<boolean> {
  if (__DEV__ || !platform) return false;
  try {
    return (await platform.storage.getItem(MARKETING_KEY)) === 'true';
  } catch {
    return false;
  }
}

export function setMarketingOptIn(on: boolean): void {
  if (__DEV__ || !platform) return;
  try {
    platform.storage.setItem(MARKETING_KEY, String(on)).catch(() => undefined);
    Krontelli.setMarketingConsent(on).catch(() => undefined);
  } catch {
    // Push is best-effort.
  }
}
