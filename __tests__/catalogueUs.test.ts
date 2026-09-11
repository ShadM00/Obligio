import {US_FEDERAL_INDUSTRY, US_STATE_REPORTS, selectReviewed} from '../convex/catalogueUs';
import {RECURRENCES} from '../convex/dates';
import {coveringScopes, GENERAL_INDUSTRY, INDUSTRIES, US_STATES} from '../src/jurisdictions';

const ALL = [...US_STATE_REPORTS, ...US_FEDERAL_INDUSTRY];
const STATE_CODES = US_STATES.map(state => state.value).filter(Boolean);
const INDUSTRY_VALUES = INDUSTRIES.map(industry => industry.value);

describe('draft US catalogue', () => {
  it('is reachable from the business it is written for', () => {
    // The regression this guards: federal rules were once seeded under a
    // scope the query never asked for, so every owner saw nothing. A state
    // entry must be found for a business in that state in any trade, and an
    // industry entry for that trade in any state.
    for (const entry of US_STATE_REPORTS) {
      for (const industry of INDUSTRY_VALUES) {
        expect(coveringScopes(entry.region, industry)).toContainEqual({
          region: entry.region,
          industry: entry.industry,
        });
      }
    }
    for (const entry of US_FEDERAL_INDUSTRY) {
      for (const region of STATE_CODES) {
        expect(coveringScopes(region, entry.industry)).toContainEqual({region: '', industry: entry.industry});
      }
    }
  });

  it('uses only the vocabulary onboarding offers', () => {
    for (const entry of US_STATE_REPORTS) {
      expect(STATE_CODES).toContain(entry.region);
      expect(entry.industry).toBe(GENERAL_INDUSTRY);
    }
    for (const entry of US_FEDERAL_INDUSTRY) {
      expect(entry.region).toBe('');
      expect(INDUSTRY_VALUES).toContain(entry.industry);
    }
  });

  it('only repeats on periods the app can schedule', () => {
    for (const entry of ALL) {
      if (entry.recurrence !== undefined) {
        expect(RECURRENCES).toContain(entry.recurrence);
      }
    }
  });

  it('links every entry to an official source', () => {
    // .gov, Colorado's state.co.us, and IFTA, Inc. — the body the member
    // jurisdictions created to administer the agreement.
    const official = (host: string) =>
      host.endsWith('.gov') || host.endsWith('.state.co.us') || host === 'www.iftach.org';
    for (const entry of ALL) {
      const url = new URL(entry.sourceUrl);
      expect(url.protocol).toBe('https:');
      expect(official(url.hostname)).toBe(true);
    }
  });

  it('never lists the same obligation twice in one scope', () => {
    const keys = ALL.map(entry => `${entry.region}|${entry.industry}|${entry.title}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('names the jurisdictions it deliberately leaves out', () => {
    // Ohio requires no annual report; New Mexico's rule could not be
    // confirmed from an official page. Adding either should be a decision,
    // made with a source, that updates this test.
    const covered = new Set(US_STATE_REPORTS.map(entry => entry.region));
    const missing = STATE_CODES.filter(code => !covered.has(code));
    expect(missing).toEqual(['NM', 'OH']);
  });

  it('keeps descriptions short enough to read on a card', () => {
    for (const entry of ALL) {
      expect(entry.description.length).toBeLessThanOrEqual(520);
    }
  });

  it('writes in US English, like the listing it ships under', () => {
    const british = /\b(licence|organisation|organised|catalogue|centre|programme|defence|enrolment)\w*/i;
    for (const entry of ALL) {
      expect(`${entry.title} ${entry.description}`).not.toMatch(british);
    }
  });
});

describe('selectReviewed', () => {
  it('seeds only the scopes named', () => {
    const picked = selectReviewed(US_STATE_REPORTS, 'region', ['WA', 'CA']);
    expect(new Set(picked.map(entry => entry.region))).toEqual(new Set(['WA', 'CA']));
    // California carries two entries: LLCs and corporations repeat differently.
    expect(picked).toHaveLength(3);
  });

  it('refuses to seed without naming what was reviewed', () => {
    expect(() => selectReviewed(US_STATE_REPORTS, 'region', [])).toThrow(/Name the regions/);
  });

  it('rejects a name with no draft entries rather than skipping it', () => {
    // A typo must not pass for a completed review.
    expect(() => selectReviewed(US_STATE_REPORTS, 'region', ['WA', 'WX'])).toThrow(/WX/);
    expect(() => selectReviewed(US_STATE_REPORTS, 'region', ['OH'])).toThrow(/OH/);
  });
});
