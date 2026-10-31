import type React from 'react';
import * as Sentry from '@sentry/react-native';

import { GLITCHTIP_DSN } from './config';

/**
 * Crash and error reports to GlitchTip, our own error server, alongside
 * Crashlytics.
 *
 * Same rule as analytics: no obligation title, business name, email or date
 * leaves the device. No breadcrumbs, because they record what was tapped and what
 * was logged, and tap labels can be the owner's own text. No user, no screenshots.
 * Release and dist come from the native project ("com.obligio.app@1.4+18").
 *
 * Off in debug builds. A failure here must never reach the user.
 */
export function initErrors(dsn: string | null = GLITCHTIP_DSN): void {
  if (!dsn || __DEV__) return;
  try {
    Sentry.init({
      dsn,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      maxBreadcrumbs: 0,
      attachScreenshot: false,
      attachViewHierarchy: false,
    });
  } catch {
    // Reporting is best-effort.
  }
}

export function wrapRoot(Root: React.ComponentType<Record<string, unknown>>) {
  return !GLITCHTIP_DSN || __DEV__ ? Root : Sentry.wrap(Root);
}
