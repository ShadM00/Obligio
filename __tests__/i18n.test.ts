import {locales} from '../src/i18n';
import {SAMPLE_REQUIREMENTS} from '../src/types';
import {screenshotRequirements} from '../src/screenshots/fixtures';

/**
 * British spellings have leaked into en-US twice now: once into the App Store
 * listing, and once into `shared` copy that both locales spread. The store
 * listing is en-US, so a British word there reads as a typo to the audience
 * the listing is written for.
 */
const BRITISH = /\b(licence|organisation|organisational|centre|programme|catalogue|defence|enrolment)\w*/i;

describe('en-US copy', () => {
  const usEntries = Object.entries(locales['en-US']).filter(
    ([, value]) => typeof value === 'string',
  ) as [string, string][];

  it.each(usEntries)('%s carries no British spelling', (_key, value) => {
    expect(value).not.toMatch(BRITISH);
  });

  it('keeps en-GB British, so the split is doing real work', () => {
    expect(locales['en-GB'].organisational).toBe('organisational');
    expect(locales['en-GB'].signInBody).toMatch(/licences/);
  });

  it('differs from en-GB wherever a locale-specific word appears', () => {
    for (const key of ['organisational', 'disclaimer', 'signInBody', 'documentsHelper'] as const) {
      expect(locales['en-US'][key]).not.toBe(locales['en-GB'][key]);
    }
  });
});

describe('demo data', () => {
  // Sample and screenshot data is what a reviewer and every store screenshot
  // shows, and both listings ship as en-US.
  const strings = [...SAMPLE_REQUIREMENTS, ...screenshotRequirements].flatMap(r => [
    r.title,
    r.category,
  ]);

  it.each(strings)('%s carries no British spelling', value => {
    expect(value).not.toMatch(BRITISH);
  });
});
