import InAppReview from 'react-native-in-app-review';

import {
  askForReview,
  REVIEW_MIN_ACCOUNT_AGE_DAYS,
  REVIEW_MIN_OBLIGATIONS,
  shouldAskForReview,
} from '../src/review';

const mocked = InAppReview as unknown as {
  isAvailable: jest.Mock;
  RequestInAppReview: jest.Mock;
};

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 9, 20);
const realDev = (globalThis as { __DEV__?: boolean }).__DEV__;

beforeEach(() => jest.clearAllMocks());
afterEach(() => {
  (globalThis as { __DEV__?: boolean }).__DEV__ = realDev;
});

describe('when to ask for a rating', () => {
  const ready = {
    accountCreatedAt: now - REVIEW_MIN_ACCOUNT_AGE_DAYS * DAY,
    now,
    obligationCount: REVIEW_MIN_OBLIGATIONS,
  };

  it('asks an established account with a few obligations', () => {
    expect(shouldAskForReview(ready)).toBe(true);
  });

  it('does not ask a new account, so never on first launch', () => {
    expect(
      shouldAskForReview({ ...ready, accountCreatedAt: now - 2 * DAY }),
    ).toBe(false);
    expect(shouldAskForReview({ ...ready, accountCreatedAt: now })).toBe(false);
  });

  it('does not ask someone with almost nothing tracked', () => {
    expect(
      shouldAskForReview({
        ...ready,
        obligationCount: REVIEW_MIN_OBLIGATIONS - 1,
      }),
    ).toBe(false);
  });

  it('does not ask when the account age is unknown', () => {
    expect(
      shouldAskForReview({ ...ready, accountCreatedAt: undefined }),
    ).toBe(false);
  });
});

describe('asking', () => {
  function asRelease() {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
  }

  it('requests the system prompt in a release build', async () => {
    asRelease();
    await askForReview();

    expect(mocked.RequestInAppReview).toHaveBeenCalledTimes(1);
  });

  it('does nothing in a debug build', async () => {
    await askForReview();

    expect(mocked.RequestInAppReview).not.toHaveBeenCalled();
  });

  it('does nothing when the platform cannot show it', async () => {
    asRelease();
    mocked.isAvailable.mockReturnValueOnce(false);
    await askForReview();

    expect(mocked.RequestInAppReview).not.toHaveBeenCalled();
  });

  it('never throws', async () => {
    asRelease();
    mocked.RequestInAppReview.mockRejectedValueOnce(new Error('quota'));

    await expect(askForReview()).resolves.toBeUndefined();
  });
});
