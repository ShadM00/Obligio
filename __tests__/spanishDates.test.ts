import {formatDisplayDate, monthLabel, parseToIsoDate} from '../src/dates';
it('round-trips every Spanish display month', () => {
  for (let month = 1; month <= 12; month++) {
    const iso = `2026-${String(month).padStart(2, '0')}-14`;
    expect(parseToIsoDate(formatDisplayDate(iso, 'es-US'), 'es-US')).toBe(iso);
  }
});
it('accepts Spanish written dates and rejects impossible dates', () => {
  expect(parseToIsoDate('14 de septiembre de 2026', 'es-US')).toBe('2026-09-14');
  expect(parseToIsoDate('31 feb 2026', 'es-US')).toBeNull();
  expect(parseToIsoDate('14/10/2026', 'es-US')).toBe('2026-10-14');
  expect(monthLabel('2026-10-14', 'es-US')).toBe('octubre 2026');
});
