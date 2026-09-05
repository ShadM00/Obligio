import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockNativeAuth = {
  getToken: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  isSignedIn: jest.fn(),
};
const mockRefreshConvexAuth = jest.fn();

jest.mock('react-native', () => ({
  NativeModules: {ObligioAuth: mockNativeAuth},
  Platform: {OS: 'ios'},
}));
jest.mock('../src/convexClient', () => ({
  refreshConvexAuth: mockRefreshConvexAuth,
  convexClient: {},
  convexUrl: 'https://example.convex.cloud',
}));

const {useSession}: typeof import('../src/session') = require('../src/session');
type Session = ReturnType<typeof useSession>;

/** Mounts the hook and exposes its latest value, without a testing library. */
async function mountSession(): Promise<() => Session> {
  let latest: Session | undefined;
  function Probe() {
    latest = useSession();
    return null;
  }
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  return () => {
    if (!latest) throw new Error('hook did not render');
    return latest;
  };
}

beforeEach(() => jest.clearAllMocks());

test('reports a signed-in session once the bridge confirms one', async () => {
  mockNativeAuth.isSignedIn.mockResolvedValue(true);
  const session = await mountSession();
  expect(session().status).toBe('signed-in');
});

test('reports signed-out rather than an error when there is no session', async () => {
  mockNativeAuth.isSignedIn.mockResolvedValue(false);
  const session = await mountSession();
  expect(session().status).toBe('signed-out');
  expect(session().error).toBeNull();
});

test('re-authenticates Convex after a successful sign-in', async () => {
  mockNativeAuth.isSignedIn.mockResolvedValue(false);
  mockNativeAuth.signIn.mockResolvedValue(undefined);
  const session = await mountSession();
  expect(session().status).toBe('signed-out');

  mockNativeAuth.isSignedIn.mockResolvedValue(true);
  await ReactTestRenderer.act(async () => {
    await session().signIn();
  });

  // Without this the client keeps querying with the pre-sign-in identity.
  expect(mockRefreshConvexAuth).toHaveBeenCalled();
  expect(session().status).toBe('signed-in');
});

test('surfaces a failed sign-in without claiming a session', async () => {
  mockNativeAuth.isSignedIn.mockResolvedValue(false);
  mockNativeAuth.signIn.mockRejectedValue(new Error('User cancelled'));
  const session = await mountSession();

  await ReactTestRenderer.act(async () => {
    await session().signIn();
  });

  expect(session().error).toBe('User cancelled');
  expect(session().status).toBe('signed-out');
});

test('still re-authenticates Convex when sign-out fails part way', async () => {
  mockNativeAuth.isSignedIn.mockResolvedValue(true);
  mockNativeAuth.signOut.mockRejectedValue(new Error('Revocation failed'));
  const session = await mountSession();
  expect(session().status).toBe('signed-in');

  await ReactTestRenderer.act(async () => {
    await session().signOut();
  });

  expect(session().error).toBe('Revocation failed');
  expect(mockRefreshConvexAuth).toHaveBeenCalled();
});
