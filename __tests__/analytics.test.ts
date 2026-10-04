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

import {
  initAnalytics,
  logObligationAdded,
  logPaywallViewed,
  recordError,
} from '../src/analytics';

beforeEach(() => jest.clearAllMocks());

describe('what the app reports', () => {
  it('logs an added obligation with only a source and whether it repeats', () => {
    logObligationAdded('template', true);
    logObligationAdded('manual', false);

    expect(logEvent).toHaveBeenNthCalledWith(
      1,
      getAnalytics(),
      'obligation_added',
      { source: 'template', recurring: 1 },
    );
    expect(logEvent).toHaveBeenNthCalledWith(
      2,
      getAnalytics(),
      'obligation_added',
      { source: 'manual', recurring: 0 },
    );
  });

  it('logs a paywall view with the reason it opened', () => {
    logPaywallViewed('evidence');

    expect(logEvent).toHaveBeenCalledWith(getAnalytics(), 'paywall_viewed', {
      reason: 'evidence',
    });
  });

  it('only ever sends the three events and parameters that are documented', () => {
    logObligationAdded('manual', true);
    logPaywallViewed('free_limit');

    const sent = (logEvent as jest.Mock).mock.calls.map(([, name, params]) => [
      name,
      Object.keys(params).sort(),
    ]);
    expect(sent).toEqual([
      ['obligation_added', ['recurring', 'source']],
      ['paywall_viewed', ['reason']],
    ]);
  });
});

describe('collection', () => {
  it('is off in debug builds so development never reaches production dashboards', () => {
    // Jest runs with __DEV__ true, as a debug build does.
    initAnalytics();

    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(
      getAnalytics(),
      false,
    );
    expect(setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(
      getCrashlytics(),
      false,
    );
  });
});

describe('crash reporting', () => {
  it('records a caught error with a fixed label', () => {
    const error = new Error('boom');
    recordError(error, 'render');

    expect(log).toHaveBeenCalledWith(getCrashlytics(), 'render');
    expect(recordCrashlyticsError).toHaveBeenCalledWith(
      getCrashlytics(),
      error,
    );
  });

  it('wraps a thrown non-error so Crashlytics still gets an Error', () => {
    recordError('plain string', 'render');

    expect(recordCrashlyticsError).toHaveBeenCalledWith(
      getCrashlytics(),
      expect.any(Error),
    );
  });
});

describe('when Firebase is not configured', () => {
  // A build without GoogleService-Info.plist / google-services.json has no
  // default app, so every Firebase call throws or rejects. The app must not.
  it('never lets a synchronous failure escape', () => {
    (getAnalytics as jest.Mock).mockImplementationOnce(() => {
      throw new Error("No Firebase App '[DEFAULT]' has been created");
    });

    expect(() => logPaywallViewed('banner')).not.toThrow();
  });

  it('never lets a rejected promise become an unhandled rejection', async () => {
    (logEvent as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('no default app')),
    );

    expect(() => logObligationAdded('manual', false)).not.toThrow();
    await Promise.resolve();
  });
});
