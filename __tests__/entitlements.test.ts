import {
  FREE_REQUIREMENT_LIMIT,
  canAddRequirement,
  canAttachEvidence,
  canUseRecurrence,
} from '../src/entitlements';

describe('canAddRequirement', () => {
  test('a free account may add up to the limit', () => {
    for (let n = 0; n < FREE_REQUIREMENT_LIMIT; n += 1) {
      expect(canAddRequirement(false, n)).toBe(true);
    }
  });

  test('a free account is blocked at and beyond the limit', () => {
    expect(canAddRequirement(false, FREE_REQUIREMENT_LIMIT)).toBe(false);
    // Stays blocked if the count ever drifts past the boundary, rather than
    // a paid feature quietly reopening.
    expect(canAddRequirement(false, FREE_REQUIREMENT_LIMIT + 5)).toBe(false);
  });

  test('Plus is never limited', () => {
    expect(canAddRequirement(true, 0)).toBe(true);
    expect(canAddRequirement(true, FREE_REQUIREMENT_LIMIT)).toBe(true);
    expect(canAddRequirement(true, 5000)).toBe(true);
  });
});

test('evidence and recurrence are Plus features', () => {
  expect(canAttachEvidence(false)).toBe(false);
  expect(canAttachEvidence(true)).toBe(true);
  expect(canUseRecurrence(false)).toBe(false);
  expect(canUseRecurrence(true)).toBe(true);
});

test('the free limit is a real limit, not zero or unbounded', () => {
  // Guards a refactor that accidentally disables gating altogether.
  expect(FREE_REQUIREMENT_LIMIT).toBeGreaterThan(0);
  expect(Number.isFinite(FREE_REQUIREMENT_LIMIT)).toBe(true);
});
