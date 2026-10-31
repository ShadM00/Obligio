const mockInit = jest.fn((_: unknown) => Promise.resolve());
const mockLogin = jest.fn();
const mockRequest = jest.fn(() => Promise.resolve('granted'));
const mockConsent = jest.fn((_: boolean) => Promise.resolve());
const mockStorage = new Map<string, string>();

jest.mock('@krontelli/sdk-react-native', () => ({
  __esModule: true,
  default: {
    init: (options: unknown) => mockInit(options),
    login: (token: string) => mockLogin(token),
    requestPermission: () => mockRequest(),
    setMarketingConsent: (on: boolean) => mockConsent(on),
  },
}));
jest.mock('@krontelli/sdk-react-native-bare', () => ({
  createBarePlatform: () => ({
    storage: {
      getItem: async (key: string) => mockStorage.get(key) ?? null,
      setItem: async (key: string, value: string) => void mockStorage.set(key, value),
    },
  }),
}));

import { KRONTELLI_PUBLIC_KEY } from '../src/config';

const realDev = (globalThis as { __DEV__?: boolean }).__DEV__;
function load(release: boolean): typeof import('../src/push') {
  (globalThis as { __DEV__?: boolean }).__DEV__ = release ? false : realDev;
  let push!: typeof import('../src/push');
  jest.isolateModules(() => {
    push = require('../src/push');
  });
  return push;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.clear();
});
afterEach(() => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = realDev;
});

describe('push notifications', () => {
  it('has a public key, never a server key', () => {
    expect(KRONTELLI_PUBLIC_KEY).toMatch(/^kt_pub_/);
  });

  it('connects to Krontelli in a release build, sending no usage events', () => {
    load(true).initPush();

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ publicKey: KRONTELLI_PUBLIC_KEY, requestPermissionOnInit: false, events: { automatic: false } }),
    );
  });

  it('does nothing in a debug build, so development never joins the audience', () => {
    load(false).initPush();

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('does nothing without a key', () => {
    load(true).initPush(null);

    expect(mockInit).not.toHaveBeenCalled();
  });

  it('never ties the device to an account', () => {
    load(true).initPush();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('never lets a failure reach the user', () => {
    mockInit.mockImplementationOnce(() => {
      throw new Error('native module missing');
    });

    expect(() => load(true).initPush()).not.toThrow();
  });
});

describe('product news opt-in', () => {
  it('is off until the owner turns it on', async () => {
    const push = load(true);
    push.initPush();

    await expect(push.marketingOptIn()).resolves.toBe(false);
  });

  it('records the choice on the device and as marketing consent', async () => {
    const push = load(true);
    push.initPush();

    push.setMarketingOptIn(true);
    await expect(push.marketingOptIn()).resolves.toBe(true);
    expect(mockConsent).toHaveBeenLastCalledWith(true);

    push.setMarketingOptIn(false);
    await expect(push.marketingOptIn()).resolves.toBe(false);
    expect(mockConsent).toHaveBeenLastCalledWith(false);
  });

  it('does nothing in a debug build', async () => {
    const push = load(false);
    push.setMarketingOptIn(true);

    expect(mockConsent).not.toHaveBeenCalled();
    await expect(push.marketingOptIn()).resolves.toBe(false);
  });
});
