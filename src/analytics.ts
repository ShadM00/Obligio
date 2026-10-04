import {
  getAnalytics,
  logEvent,
  setAnalyticsCollectionEnabled,
} from '@react-native-firebase/analytics';
import {
  getCrashlytics,
  log,
  recordError as recordCrashlyticsError,
  setCrashlyticsCollectionEnabled,
} from '@react-native-firebase/crashlytics';

/**
 * Everything the app reports, in one place.
 *
 * Three things leave the device:
 *
 * - `obligation_added`: an obligation was saved, by hand or from a suggestion.
 * - `paywall_viewed`: the Obligio Plus screen was opened, and what opened it.
 * - Crashes and uncaught errors, through Crashlytics.
 *
 * "First launch" is Firebase's own automatic `first_open` event, so it is not
 * logged a second time here. The SDK also sends a few automatic events of its
 * own (session_start, user_engagement, app_update); docs/analytics-and-privacy.md
 * lists them.
 *
 * Parameters are fixed vocabularies and numbers. Nothing here ever carries an
 * obligation title, a business name, an email, a due date, a document or a user
 * id: the point of keeping the list this short is that the App Privacy and
 * Data Safety answers stay true.
 *
 * Reporting must never break the app, so every call is guarded. A build without
 * the Firebase config file (it is not in the repository) has no default app and
 * each call throws; that is swallowed here and the app runs unobserved.
 */

export type PaywallReason =
  /** The free obligation limit was hit when adding one. */
  | 'free_limit'
  /** The "free limit reached" banner was tapped. */
  | 'banner'
  /** Attaching evidence, which is part of Plus. */
  | 'evidence'
  /** The subscription card in Settings. */
  | 'settings';

export type ObligationSource = 'manual' | 'template';

function safely(run: () => unknown): void {
  try {
    const result = run();
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      (result as Promise<unknown>).catch(() => undefined);
    }
  } catch {
    // Reporting is best-effort.
  }
}

/**
 * Call once at startup. Debug builds never report, so developing and running
 * the test suite do not put noise into the production dashboards.
 */
export function initAnalytics(): void {
  safely(() => setAnalyticsCollectionEnabled(getAnalytics(), !__DEV__));
  safely(() => setCrashlyticsCollectionEnabled(getCrashlytics(), !__DEV__));
}

export function logObligationAdded(
  source: ObligationSource,
  recurring: boolean,
): void {
  safely(() =>
    logEvent(getAnalytics(), 'obligation_added', {
      source,
      recurring: recurring ? 1 : 0,
    }),
  );
}

export function logPaywallViewed(reason: PaywallReason): void {
  safely(() => logEvent(getAnalytics(), 'paywall_viewed', { reason }));
}

/**
 * Records an error that was caught but should still be seen, such as a render
 * failure the error boundary recovered from. `where` is a fixed label, never
 * user content.
 */
export function recordError(error: unknown, where: string): void {
  safely(() => {
    const failure = error instanceof Error ? error : new Error(String(error));
    const crashlytics = getCrashlytics();
    log(crashlytics, where);
    recordCrashlyticsError(crashlytics, failure);
  });
}
