import {locales} from '../src/i18n';
import {parseToIsoDate, formatDisplayDate, monthLabel} from '../src/dates';
it('offers French billing and account management', () => {
  expect(locales['fr-CA'].text('Restore purchases')).toBe('Restaurer les achats');
  expect(locales['fr-CA'].deleteAccountBody).toContain('ne résilie pas');
  expect(locales['fr-CA'].text('Open official source')).toBe('Ouvrir la source officielle');
});
it('requires unambiguous ISO date entry and formats French dates', () => {
  expect(parseToIsoDate('2026-04-03', 'fr-CA')).toBe('2026-04-03');
  expect(parseToIsoDate('03/04/2026', 'fr-CA')).toBeNull();
  expect(formatDisplayDate('2026-04-03', 'fr-CA')).toContain('avr');
  expect(monthLabel('2026-04-03', 'fr-CA')).toBe('avril 2026');
});

import {INTERNATIONAL_RULES} from '../convex/catalogueInternational';
import {localizeTemplate} from '../src/catalogueTranslations';
it('translates every international entry while preserving jurisdiction and sources', () => {
  for (const rule of INTERNATIONAL_RULES) {
    for (const locale of ['fr-CA', 'es-US']) {
      const translated = localizeTemplate(rule, locale);
      expect(translated.title).not.toBe(rule.title);
      expect(translated.description).not.toBe(rule.description);
      expect(translated.sourceUrl).toBe(rule.sourceUrl);
      expect(translated.country).toBe(rule.country);
      expect(translated.locality).toBe(rule.locality);
      expect(translated.entityTypes).toBe(rule.entityTypes);
    }
  }
});
