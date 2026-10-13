import InAppReview from 'react-native-in-app-review';

/**
 * Asking for an App Store / Play rating.
 *
 * A rating prompt belongs at a success moment, never at first launch and never
 * after an error. The app has nowhere persistent to keep a counter, so the
 * rule is built from what it can see:
 *
 * - the owner has just marked an obligation done, successfully;
 * - the account is at least a week old and already tracks a few obligations,
 *   so this is someone using the app, not someone who just installed it;
 * - at most once per app session.
 *
 * The operating system does the real rate limiting (Apple shows the prompt at
 * most three times a year and may decline any request; Play has a quota), so
 * asking is safe even when it is a no-op.
 *
 * A failure here must never reach the user.
 */
export const REVIEW_MIN_ACCOUNT_AGE_DAYS = 7;
export const REVIEW_MIN_OBLIGATIONS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function shouldAskForReview({
  accountCreatedAt,
  now,
  obligationCount,
}: {
  /** Milliseconds since the epoch, or undefined when unknown. */
  accountCreatedAt: number | undefined;
  now: number;
  obligationCount: number;
}): boolean {
  if (typeof accountCreatedAt !== 'number') return false;
  if (now - accountCreatedAt < REVIEW_MIN_ACCOUNT_AGE_DAYS * DAY_MS) {
    return false;
  }
  return obligationCount >= REVIEW_MIN_OBLIGATIONS;
}

export async function askForReview(): Promise<void> {
  if (__DEV__) return;
  try {
    if (InAppReview.isAvailable()) {
      await InAppReview.RequestInAppReview();
    }
  } catch {
    // Asking for a rating is best-effort.
  }
}
