import {validateProfile, ruleMatchesBusiness, regionsFor} from '../src/jurisdictions';
import {INTERNATIONAL_RULES} from '../convex/catalogueInternational';
const base = {name: 'Test', country: 'AU' as const, region: 'WA', industry: 'FoodService', entityType: 'company', locality: 'city-of-perth'};
it('rejects country/region/locality mismatches', () => {
  expect(() => validateProfile(base)).not.toThrow();
  expect(() => validateProfile({...base, country: 'CA'})).toThrow();
  expect(() => validateProfile({...base, region: 'NSW'})).toThrow();
});
it('never confuses Western Australia with Washington', () => {
  const rule = INTERNATIONAL_RULES.find(r => r.country === 'AU' && r.region === 'WA')!;
  expect(ruleMatchesBusiness(rule, base)).toBe(true);
  expect(ruleMatchesBusiness(rule, {...base, country: 'US'})).toBe(false);
});
it('local requirements stay within the selected council area', () => {
  const rule = INTERNATIONAL_RULES.find(r => r.locality)!;
  expect(ruleMatchesBusiness(rule, base)).toBe(true);
  expect(ruleMatchesBusiness(rule, {...base, locality: ''})).toBe(false);
});
it('does not assume a company filing applies to unknown or sole-trader entities', () => {
  const rule = INTERNATIONAL_RULES[0];
  expect(ruleMatchesBusiness(rule, {...base, entityType: ''})).toBe(false);
  expect(ruleMatchesBusiness(rule, {...base, entityType: 'soleTrader'})).toBe(false);
});
it('Canadian federal filings do not apply to provincial corporations by default', () => {
  const rule = INTERNATIONAL_RULES.find(r => r.country === 'CA')!;
  expect(ruleMatchesBusiness(rule, {...base, country: 'CA', region: 'ON', entityType: 'company'})).toBe(false);
  expect(ruleMatchesBusiness(rule, {...base, country: 'CA', region: 'ON', entityType: 'federalCorporation'})).toBe(true);
});
it('WA registration is not turned into a recurring annual deadline', () => {
  expect(INTERNATIONAL_RULES.find(r => r.country === 'AU' && r.region === 'WA')!.recurrence).toBeUndefined();
});
it('covers all eight Australian and thirteen Canadian subdivisions', () => {
  expect(regionsFor('AU')).toHaveLength(9);
  expect(regionsFor('CA')).toHaveLength(14);
});
