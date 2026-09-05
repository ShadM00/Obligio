import type {Locale} from './i18n';

/**
 * The app stores every due date as an ISO calendar date (`YYYY-MM-DD`) and
 * formats it for display at the edge. Free-text dates never reach Convex,
 * which is what recurrence scheduling depends on.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DISPLAY_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= lastDay;
}

function toIso(year: number, month: number, day: number): string | null {
  if (!isRealDate(year, month, day)) return null;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return isRealDate(year, month, day);
}

/**
 * Best-effort parse of what someone might type into the due-date field.
 *
 * Accepts `2026-10-14`, `Oct 14, 2026`, `14 Oct 2026`, and slash-separated
 * dates. Slash order follows the locale, because `03/04/2026` is March 4th to a
 * US owner and 3rd April to a UK one. Returns null when the input is not a real
 * date, so callers can refuse to save rather than store something unusable.
 */
export function parseToIsoDate(input: string, locale: Locale = 'en-US'): string | null {
  const text = input.trim();
  if (!text) return null;

  if (ISO_DATE.test(text)) {
    const [year, month, day] = text.split('-').map(Number);
    return toIso(year, month, day);
  }

  // "Oct 14, 2026" / "October 14 2026"
  const monthFirst = text.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
  if (monthFirst) {
    const month = MONTH_NAMES.indexOf(monthFirst[1].slice(0, 3).toLowerCase()) + 1;
    if (month > 0) return toIso(Number(monthFirst[3]), month, Number(monthFirst[2]));
    return null;
  }

  // "14 Oct 2026" / "14 October 2026"
  const dayFirst = text.match(/^(\d{1,2})(?:st|nd|rd|th)?\.?\s+([A-Za-z]{3,})\.?,?\s+(\d{4})$/);
  if (dayFirst) {
    const month = MONTH_NAMES.indexOf(dayFirst[2].slice(0, 3).toLowerCase()) + 1;
    if (month > 0) return toIso(Number(dayFirst[3]), month, Number(dayFirst[1]));
    return null;
  }

  // "10/14/2026" (en-US) or "14/10/2026" (en-GB); also accepts "-" and "."
  const numeric = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    const year = Number(numeric[3]);
    const [month, day] = locale === 'en-US' ? [first, second] : [second, first];
    return toIso(year, month, day);
  }

  return null;
}

export function formatDisplayDate(iso: string, locale: Locale = 'en-US'): string {
  if (!isIsoDate(iso)) return iso;
  const [year, month, day] = iso.split('-').map(Number);
  const monthName = DISPLAY_MONTHS[month - 1];
  return locale === 'en-GB' ? `${day} ${monthName} ${year}` : `${monthName} ${day}, ${year}`;
}

export function todayIso(): string {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate())!;
}

/** `current` once satisfied, `overdue` once the date has passed, else `upcoming`. */
export function statusForDueDate(iso: string, today = todayIso()): 'upcoming' | 'overdue' {
  return iso < today ? 'overdue' : 'upcoming';
}

/** Month heading used to group the calendar, e.g. "October 2026". */
export function monthLabel(iso: string): string {
  if (!isIsoDate(iso)) return 'Undated';
  const [year, month] = iso.split('-').map(Number);
  const full = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${full[month - 1]} ${year}`;
}
