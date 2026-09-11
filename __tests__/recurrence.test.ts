import {RECURRENCES, nextDueDate} from '../convex/dates';
import {RECURRENCE_OPTIONS, repeatsLabel} from '../src/recurrence';

describe('recurrence labels', () => {
  it('offers every period the server accepts, plus one-off', () => {
    // A period the server schedules but the picker omits could never be
    // chosen by hand; one the picker offers but the server rejects would fail
    // on save.
    const offered = RECURRENCE_OPTIONS.map(option => option.value).filter(Boolean);
    expect(offered).toEqual(RECURRENCES);
    expect(RECURRENCE_OPTIONS[0]).toEqual({value: undefined, label: 'One-off'});
  });

  it('reads multi-year periods in words, not Latin', () => {
    expect(repeatsLabel('biennial')).toBe('every 2 years');
    expect(repeatsLabel('triennial')).toBe('every 3 years');
    expect(repeatsLabel('quinquennial')).toBe('every 5 years');
  });

  it('keeps the wording already on screen for the original periods', () => {
    // The store screenshots show "Repeats quarterly" and "Repeats annual".
    expect(repeatsLabel('quarterly')).toBe('quarterly');
    expect(repeatsLabel('annual')).toBe('annual');
  });

  it('schedules every offered period', () => {
    for (const value of RECURRENCES) {
      expect(() => nextDueDate('2026-10-14', value)).not.toThrow();
    }
  });
});
