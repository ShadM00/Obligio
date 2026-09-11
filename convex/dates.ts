/**
 * Calendar-date helpers shared by the Convex functions.
 *
 * Every `dueDate` stored in the database is an ISO calendar date (`YYYY-MM-DD`)
 * with no time or zone component. Display formatting is the client's job; the
 * backend only ever sees and stores the canonical form.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * How often an obligation repeats, and the months each period spans.
 *
 * Multi-year periods exist because real filings use them: California's
 * Statement of Information is biennial, a DEA registration is renewed every
 * three years, EPA lead-safe firm certification every five. Squeezing those
 * into `annual` would tell an owner to file something that is not due.
 */
export const RECURRENCE_MONTHS = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
  biennial: 24,
  triennial: 36,
  quinquennial: 60,
} as const;

export const RECURRENCES = Object.keys(RECURRENCE_MONTHS) as (keyof typeof RECURRENCE_MONTHS)[];
export type Recurrence = keyof typeof RECURRENCE_MONTHS;

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Rejects real-looking but impossible dates such as 2026-02-31, which the
  // Date constructor would silently roll forward into March.
  return parsed.toISOString().slice(0, 10) === value;
}

export function assertIsoDate(value: string, field = 'dueDate'): string {
  if (!isIsoDate(value)) {
    throw new Error(`${field} must be an ISO calendar date (YYYY-MM-DD); received "${value}".`);
  }
  return value;
}

export function isRecurrence(value: string): value is Recurrence {
  return (RECURRENCES as readonly string[]).includes(value);
}

export function assertRecurrence(value: string): Recurrence {
  if (!isRecurrence(value)) {
    throw new Error(`recurrence must be one of ${RECURRENCES.join(', ')}; received "${value}".`);
  }
  return value;
}

/** Advances an ISO date by one recurrence period, clamping to the month end. */
export function nextDueDate(date: string, recurrence: string): string {
  assertIsoDate(date);
  const period = assertRecurrence(recurrence);
  const [year, month, day] = date.split('-').map(Number);
  const monthsToAdd = RECURRENCE_MONTHS[period];

  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = (targetMonthIndex % 12) + 1;

  // Day 0 of the following month is the last day of the target month, so a
  // 31st rolls back to the 30th/28th instead of spilling into the next month.
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDayOfTargetMonth);

  return `${String(targetYear).padStart(4, '0')}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
}

/** Today in UTC as an ISO calendar date. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The status a requirement should carry for a given due date. A date already
 * past is overdue the moment it is recorded; nothing else is assumed.
 */
export function statusForDueDate(dueDate: string, today = todayIso()): 'upcoming' | 'overdue' {
  assertIsoDate(dueDate);
  return dueDate < today ? 'overdue' : 'upcoming';
}
