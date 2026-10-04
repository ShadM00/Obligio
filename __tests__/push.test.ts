import { OneSignal } from 'react-native-onesignal';

import { ONESIGNAL_APP_ID } from '../src/config';
import { initPush } from '../src/push';

const mocked = OneSignal as unknown as {
  initialize: jest.Mock;
  login: jest.Mock;
  Notifications: { requestPermission: jest.Mock };
};

const realDev = (globalThis as { __DEV__?: boolean }).__DEV__;
beforeEach(() => jest.clearAllMocks());
afterEach(() => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = realDev;
});

function asRelease() {
  (globalThis as { __DEV__?: boolean }).__DEV__ = false;
}

describe('push notifications', () => {
  it('has an app id that looks like a OneSignal one', () => {
    expect(ONESIGNAL_APP_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('connects to OneSignal in a release build', () => {
    asRelease();
    initPush();

    expect(mocked.initialize).toHaveBeenCalledWith(ONESIGNAL_APP_ID);
  });

  it('does nothing in a debug build, so development never joins the audience', () => {
    // Jest runs with __DEV__ true, as a debug build does.
    initPush();

    expect(mocked.initialize).not.toHaveBeenCalled();
  });

  it('does nothing without an app id', () => {
    asRelease();
    initPush(null);

    expect(mocked.initialize).not.toHaveBeenCalled();
  });

  it('never asks for permission itself: the reminder flow already does', () => {
    asRelease();
    initPush();

    expect(mocked.Notifications.requestPermission).not.toHaveBeenCalled();
  });

  it('never ties the device to an account', () => {
    asRelease();
    initPush();

    expect(mocked.login).not.toHaveBeenCalled();
  });

  it('never lets a failure reach the user', () => {
    asRelease();
    mocked.initialize.mockImplementationOnce(() => {
      throw new Error('native module missing');
    });

    expect(() => initPush()).not.toThrow();
  });
});
