// The Convex auth callback must turn a refused Clerk token into "no token"
// (null), not a rejection that escapes Convex unhandled.
const mockSetAuth = jest.fn();
jest.mock('convex/react', () => ({
  ConvexReactClient: jest.fn().mockImplementation(() => ({ setAuth: mockSetAuth })),
}));
const mockGetToken = jest.fn();
jest.mock('../src/nativeAuth', () => ({
  authBridge: { available: true, getToken: (force: boolean) => mockGetToken(force) },
}));
const mockRecordError = jest.fn();
jest.mock('../src/analytics', () => ({ recordError: (...args: unknown[]) => mockRecordError(...args) }));
const mockReportHandled = jest.fn();
jest.mock('../src/errors', () => ({ reportHandledError: (...args: unknown[]) => mockReportHandled(...args) }));

require('../src/convexClient');
const fetchToken: (args: { forceRefreshToken: boolean }) => Promise<string | null> =
  mockSetAuth.mock.calls[0][0];

beforeEach(() => {
  mockGetToken.mockReset();
  mockRecordError.mockReset();
  mockReportHandled.mockReset();
});

test('passes a token through and forwards the refresh flag', async () => {
  mockGetToken.mockResolvedValue('jwt');
  await expect(fetchToken({ forceRefreshToken: true })).resolves.toBe('jwt');
  expect(mockGetToken).toHaveBeenCalledWith(true);
  expect(mockReportHandled).not.toHaveBeenCalled();
});

test('a refused token becomes null and is reported, not thrown', async () => {
  const refused = new Error('No session was found with id sess_test');
  mockGetToken.mockRejectedValue(refused);
  await expect(fetchToken({ forceRefreshToken: false })).resolves.toBeNull();
  expect(mockReportHandled).toHaveBeenCalledWith(refused, 'convex-auth-token');
  expect(mockRecordError).toHaveBeenCalledWith(refused, 'convex-auth-token');
});

test('keeps a signed-out null as null', async () => {
  mockGetToken.mockResolvedValue(null);
  await expect(fetchToken({ forceRefreshToken: false })).resolves.toBeNull();
});
