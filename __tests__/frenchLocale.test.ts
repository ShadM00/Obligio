import { locales } from '../src/i18n';
import { parseToIsoDate, formatDisplayDate, monthLabel } from '../src/dates';
it('offers French billing and account management', () => {
  expect(locales['fr-CA'].text('Restore purchases')).toBe(
    'Restaurer les achats',
  );
  expect(locales['fr-CA'].deleteAccountBody).toContain('ne résilie pas');
  expect(locales['fr-CA'].text('Open official source')).toBe(
    'Ouvrir la source officielle',
  );
});
it('requires unambiguous ISO date entry and formats French dates', () => {
  expect(parseToIsoDate('2026-04-03', 'fr-CA')).toBe('2026-04-03');
  expect(parseToIsoDate('03/04/2026', 'fr-CA')).toBeNull();
  expect(formatDisplayDate('2026-04-03', 'fr-CA')).toContain('avr');
  expect(monthLabel('2026-04-03', 'fr-CA')).toBe('avril 2026');
});

import { INTERNATIONAL_RULES } from '../convex/catalogueInternational';
import { hasTranslation, localizeTemplate } from '../src/catalogueTranslations';
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

it('has a translation of the current English for every international rule', () => {
  // Fails when a rule's English is edited without updating its translation,
  // which would otherwise show French and Spanish owners the old wording.
  for (const rule of INTERNATIONAL_RULES) {
    expect(hasTranslation(rule)).toBe(true);
  }
});
it('falls back to English when a translation is of older wording', () => {
  const rule = {
    ...INTERNATIONAL_RULES[0],
    description: 'Revised wording nobody has translated yet.',
  };
  expect(localizeTemplate(rule, 'fr-CA')).toEqual(rule);
});
it('translates rules that share a title by their own wording', () => {
  const food = INTERNATIONAL_RULES.filter(
    rule => rule.country === 'GB' && rule.industry === 'FoodService',
  );
  const scotland = food.find(rule => rule.region === 'SCT')!;
  const england = food.find(rule => rule.region === 'ENG')!;
  expect(scotland.title).toBe(england.title);
  expect(localizeTemplate(scotland, 'fr-CA').description).toContain('Écosse');
  expect(localizeTemplate(england, 'fr-CA').description).toContain(
    'Angleterre',
  );
});
it('still translates the City of Perth wording that is live until the sync', () => {
  const live = {
    ...INTERNATIONAL_RULES.find(rule => rule.locality === 'city-of-perth')!,
    title: 'City of Perth food premises approval',
    description:
      'For premises inside the City of Perth council area, confirm whether registration or notification is required. New fit-outs and structural changes may need building or planning approval before food-business approval. Contact the City about the form appropriate to your premises. This does not cover the whole Perth metropolitan area.',
  };
  expect(localizeTemplate(live, 'fr-CA').title).toBe(
    'Autorisation des locaux alimentaires dans la ville de Perth',
  );
});
