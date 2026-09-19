import Purchases from 'react-native-purchases';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(), setLogLevel: jest.fn(),
    logIn: jest.fn(async () => ({})), logOut: jest.fn(async () => ({})),
    isAnonymous: jest.fn(async () => false),
    restorePurchases: jest.fn(async () => ({})), purchasePackage: jest.fn(async () => ({})),
  },
  LOG_LEVEL: {INFO: 'INFO'},
}));
jest.mock('../src/config', () => ({revenueCatApiKey: 'test-public-key'}));
import {identifyBillingUser, isBillingUserReady, restorePurchases} from '../src/billing';

beforeEach(() => jest.clearAllMocks());

test('uses the stable account ID and clears it on sign-out', async () => {
  await identifyBillingUser('user_reviewer');
  expect(Purchases.logIn).toHaveBeenCalledWith('user_reviewer');
  expect(isBillingUserReady('user_reviewer')).toBe(true);
  await identifyBillingUser(null);
  expect(Purchases.logOut).toHaveBeenCalledTimes(1);
  expect(isBillingUserReady('user_reviewer')).toBe(false);
  await expect(restorePurchases()).rejects.toThrow('Sign in');
});

test('serializes a slow old login before switching accounts', async () => {
  let finish!: () => void;
  jest.mocked(Purchases.logIn).mockImplementationOnce(() => new Promise(resolve => {
    finish = () => resolve({} as never);
  }));
  const first = identifyBillingUser('user_a');
  await new Promise(resolve => setTimeout(resolve, 0));
  const second = identifyBillingUser('user_b');
  expect(isBillingUserReady('user_a')).toBe(false);
  finish();
  await Promise.all([first, second]);
  expect(isBillingUserReady('user_a')).toBe(false);
  expect(isBillingUserReady('user_b')).toBe(true);
  expect(jest.mocked(Purchases.logIn).mock.calls.map(call => call[0])).toEqual(['user_a', 'user_b']);
});

test('failed login cannot restore purchases under a previous identity', async () => {
  await identifyBillingUser('user_a');
  jest.mocked(Purchases.logIn).mockRejectedValueOnce(new Error('offline'));
  await expect(identifyBillingUser('user_b')).rejects.toThrow('offline');
  expect(isBillingUserReady('user_b')).toBe(false);
  await expect(restorePurchases()).rejects.toThrow('offline');
  expect(Purchases.restorePurchases).not.toHaveBeenCalled();
  await identifyBillingUser('user_b');
  expect(isBillingUserReady('user_b')).toBe(true);
});
