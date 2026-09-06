import {formatDisplayDate, isIsoDate, monthLabel, parseToIsoDate, statusForDueDate} from '../src/dates';
import {nextDueDate} from '../convex/dates';
import {reminderTimestampFor} from '../src/notifications';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {},
  AndroidImportance: {DEFAULT: 3},
  AuthorizationStatus: {DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2},
  TriggerType: {TIMESTAMP: 0},
}));

describe('isIsoDate', () => {
  test('accepts real calendar dates', () => {
    expect(isIsoDate('2026-10-14')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
  });

  test('rejects impossible dates the Date constructor would roll forward', () => {
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('2025-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('Oct 14, 2026')).toBe(false);
  });
});

describe('parseToIsoDate', () => {
  test('accepts the formats the due-date field advertises', () => {
    expect(parseToIsoDate('2026-10-14')).toBe('2026-10-14');
    expect(parseToIsoDate('Oct 14, 2026')).toBe('2026-10-14');
    expect(parseToIsoDate('October 14 2026')).toBe('2026-10-14');
    expect(parseToIsoDate('14 Oct 2026', 'en-GB')).toBe('2026-10-14');
  });

  test('reads slash dates in the locale order', () => {
    expect(parseToIsoDate('03/04/2026', 'en-US')).toBe('2026-03-04');
    expect(parseToIsoDate('03/04/2026', 'en-GB')).toBe('2026-04-03');
  });

  test('returns null rather than an unusable date', () => {
    expect(parseToIsoDate('')).toBeNull();
    expect(parseToIsoDate('next Tuesday')).toBeNull();
    expect(parseToIsoDate('Feb 31, 2026')).toBeNull();
  });
});

describe('formatDisplayDate', () => {
  test('formats per locale', () => {
    expect(formatDisplayDate('2026-10-14', 'en-US')).toBe('Oct 14, 2026');
    expect(formatDisplayDate('2026-10-14', 'en-GB')).toBe('14 Oct 2026');
  });

  test('round-trips through the parser', () => {
    const iso = '2026-10-14';
    expect(parseToIsoDate(formatDisplayDate(iso, 'en-US'), 'en-US')).toBe(iso);
    expect(parseToIsoDate(formatDisplayDate(iso, 'en-GB'), 'en-GB')).toBe(iso);
  });
});

describe('nextDueDate', () => {
  test('advances by the recurrence period', () => {
    expect(nextDueDate('2026-10-14', 'monthly')).toBe('2026-11-14');
    expect(nextDueDate('2026-10-14', 'quarterly')).toBe('2027-01-14');
    expect(nextDueDate('2026-10-14', 'annual')).toBe('2027-10-14');
  });

  test('clamps to the end of a shorter month instead of spilling over', () => {
    expect(nextDueDate('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(nextDueDate('2024-01-31', 'monthly')).toBe('2024-02-29');
  });

  test('refuses a display-formatted date instead of producing Invalid Date', () => {
    expect(() => nextDueDate('Oct 14, 2026', 'annual')).toThrow(/ISO calendar date/);
  });

  test('refuses an unknown recurrence instead of silently treating it as annual', () => {
    expect(() => nextDueDate('2026-10-14', 'fortnightly')).toThrow(/recurrence must be one of/);
  });
});

describe('statusForDueDate and monthLabel', () => {
  test('flags a passed date as overdue', () => {
    expect(statusForDueDate('2026-01-01', '2026-06-01')).toBe('overdue');
    expect(statusForDueDate('2026-12-01', '2026-06-01')).toBe('upcoming');
  });

  test('groups by month', () => {
    expect(monthLabel('2026-10-14')).toBe('October 2026');
  });
});

describe('reminderTimestampFor', () => {
  test('returns the earliest lead time still ahead', () => {
    // Six weeks out, so the 30-day reminder is the first one due: 14 Sept.
    const now = new Date(2026, 8, 1).getTime();
    const timestamp = reminderTimestampFor('2026-10-14', now);
    expect(timestamp).not.toBeNull();
    expect(new Date(timestamp!).getMonth()).toBe(8);
    expect(new Date(timestamp!).getDate()).toBe(14);
  });

  test('falls through to a nearer lead time once the earlier ones pass', () => {
    // Ten days out: 30 and 14 have gone, so the 7-day reminder is next.
    const now = new Date(2026, 9, 4).getTime();
    const timestamp = reminderTimestampFor('2026-10-14', now);
    expect(timestamp).not.toBeNull();
    expect(new Date(timestamp!).getDate()).toBe(7);
  });

  test('returns null once every lead time has passed', () => {
    // On the due date itself, all four reminders are behind us.
    const now = new Date(2026, 9, 14, 12).getTime();
    expect(reminderTimestampFor('2026-10-14', now)).toBeNull();
    expect(reminderTimestampFor('not-a-date', now)).toBeNull();
  });
});

describe('server-side statusForDueDate', () => {
  const {statusForDueDate: serverStatus, todayIso: serverToday} =
    require('../convex/dates') as typeof import('../convex/dates');

  test('a date already past is overdue', () => {
    expect(serverStatus('2026-01-01', '2026-06-01')).toBe('overdue');
  });

  test('today is not yet overdue', () => {
    expect(serverStatus('2026-06-01', '2026-06-01')).toBe('upcoming');
  });

  test('a future date is upcoming', () => {
    expect(serverStatus('2026-12-01', '2026-06-01')).toBe('upcoming');
  });

  test('refuses a display-formatted date rather than mis-classifying it', () => {
    expect(() => serverStatus('Jun 1, 2026')).toThrow(/ISO calendar date/);
  });

  test('todayIso returns a valid ISO date', () => {
    expect(serverToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
