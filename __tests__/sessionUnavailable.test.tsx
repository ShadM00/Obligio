import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// A build without the native Clerk module: NativeModules.ObligioAuth is absent.
// This lives in its own file because resetting modules mid-suite would give the
// hook a second React instance.
jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: {OS: 'ios'},
}));
jest.mock('../src/convexClient', () => ({
  refreshConvexAuth: jest.fn(),
  convexClient: {},
  convexUrl: 'https://example.convex.cloud',
}));

const {useSession}: typeof import('../src/session') = require('../src/session');

test('fails closed as unavailable rather than offering an impossible sign-in', async () => {
  let status: string | undefined;
  let error: string | null | undefined;
  function Probe() {
    const session = useSession();
    status = session.status;
    error = session.error;
    return null;
  }
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe />);
  });

  expect(status).toBe('unavailable');
  expect(error).toBeNull();
});
