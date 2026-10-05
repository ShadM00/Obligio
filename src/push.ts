import { OneSignal } from 'react-native-onesignal';

import { ONESIGNAL_APP_ID } from './config';

/**
 * Push notifications, through OneSignal.
 *
 * This only connects the app to OneSignal. It deliberately does three things
 * it could have done and doesn't:
 *
 * - It never asks for notification permission. The app already asks, through
 *   `prepareNotifications` in notifications.ts, when the owner sets up
 *   reminders; the permission is the operating system's single notification
 *   permission, so OneSignal registers a push token as soon as that is granted.
 *   A second prompt would be a second, worse moment to ask.
 * - It never calls `login`, so a device's push subscription is not tied to the
 *   Clerk account or any email. Pushes can be sent to everyone or to segments
 *   of devices, not to a named person.
 * - It does nothing in debug builds, so a developer's simulator or phone never
 *   joins the production audience.
 *
 * Local deadline reminders (Notifee) are unaffected and keep working with no
 * network and no OneSignal.
 *
 * Like analytics, a failure here must never reach the user.
 */
export function initPush(appId: string | null = ONESIGNAL_APP_ID): void {
  if (!appId || __DEV__) return;
  try {
    OneSignal.initialize(appId);
  } catch {
    // Push is best-effort.
  }
}

/**
 * The device-level tag that records an in-app opt-in to product news and
 * offers. Apple's guideline 4.5.4 forbids promotional pushes unless people
 * explicitly agreed in the app's own UI, so this is off until the owner turns
 * it on in Settings, and a promotional message must be sent only to devices
 * tagged `marketing_opt_in = true`. Deadline reminders do not depend on it.
 */
export const MARKETING_TAG = 'marketing_opt_in';

export async function marketingOptIn(): Promise<boolean> {
  if (__DEV__) return false;
  try {
    const tags = await OneSignal.User.getTags();
    return tags?.[MARKETING_TAG] === 'true';
  } catch {
    return false;
  }
}

export function setMarketingOptIn(on: boolean): void {
  if (__DEV__) return;
  try {
    if (on) OneSignal.User.addTag(MARKETING_TAG, 'true');
    else OneSignal.User.removeTag(MARKETING_TAG);
  } catch {
    // Push is best-effort.
  }
}
