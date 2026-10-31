import Krontelli from '@krontelli/sdk-react-native';
import { createBarePlatform } from '@krontelli/sdk-react-native-bare';

import { initialLocale } from './i18n';
import { KRONTELLI_PUBLIC_KEY } from './config';

/**
 * Push notifications, through Krontelli, our own push server.
 *
 * This only connects the app to Krontelli. It deliberately does four things it
 * could have done and doesn't:
 *
 * - It never asks for notification permission. The app already asks, through
 *   `prepareNotifications` in notifications.ts, when the owner sets up
 *   reminders; the permission is the operating system's single notification
 *   permission, so a push token is reported as soon as that is granted. A second
 *   prompt would be a second, worse moment to ask.
 * - It never calls `login`, so a device's push subscription is not tied to the
 *   Clerk account or any email. Pushes can be sent to everyone or to segments
 *   of devices, not to a named person.
 * - It sends no usage events: the only record is whether a push arrived and was
 *   opened.
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
    Krontelli.init({
      apiBaseUrl: 'https://api.krontelli.com',
      publicKey,
      requestPermissionOnInit: false,
      events: { automatic: false },
      platform,
    }).catch(() => undefined);
  } catch {
    // Push is best-effort.
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
