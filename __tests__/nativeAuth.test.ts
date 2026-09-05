const mockNativeAuth = {
  getToken: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  isSignedIn: jest.fn(),
};

jest.mock('react-native', () => ({
  NativeModules: {ObligioAuth: mockNativeAuth},
  Platform: {OS: 'android'},
}));

// Load after the native mock is initialized (ES imports are hoisted).
const {authBridge}: typeof import('../src/nativeAuth') = require('../src/nativeAuth');

beforeEach(() => jest.resetAllMocks());

test('forwards the forced-refresh request to the native SDK', async () => {
  mockNativeAuth.getToken.mockResolvedValue('short-lived-token');
  await expect(authBridge.getToken(true)).resolves.toBe('short-lived-token');
  expect(mockNativeAuth.getToken).toHaveBeenCalledWith(true);
});

test('defaults to ordinary SDK token retrieval and preserves signed-out null', async () => {
  mockNativeAuth.getToken.mockResolvedValue(null);
  await expect(authBridge.getToken()).resolves.toBeNull();
  expect(mockNativeAuth.getToken).toHaveBeenCalledWith(false);
});

test('does not hide a failed token refresh', async () => {
  mockNativeAuth.getToken.mockRejectedValue(new Error('Refresh failed'));
  await expect(authBridge.getToken(true)).rejects.toThrow('Refresh failed');
});

test('does not report successful sign-out if native revocation fails', async () => {
  mockNativeAuth.signOut.mockRejectedValue(new Error('Revocation failed'));
  await expect(authBridge.signOut()).rejects.toThrow('Revocation failed');
});

test('waits for native sign-out completion', async () => {
  mockNativeAuth.signOut.mockResolvedValue(undefined);
  await expect(authBridge.signOut()).resolves.toBeUndefined();
  expect(mockNativeAuth.signOut).toHaveBeenCalledTimes(1);
});
