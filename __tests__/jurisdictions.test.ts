import {coveringScopes, GENERAL_INDUSTRY, INDUSTRIES, US_STATES} from '../src/jurisdictions';

describe('coveringScopes', () => {
  it('covers a specific state and trade with all four scopes', () => {
    expect(coveringScopes('WA', 'FoodService')).toEqual([
      {region: 'WA', industry: 'FoodService'},
      {region: '', industry: 'FoodService'},
      {region: 'WA', industry: GENERAL_INDUSTRY},
      {region: '', industry: GENERAL_INDUSTRY},
    ]);
  });

  it('reaches federal general rules from every state and industry', () => {
    // The regression this exists for: the catalogue is seeded country-wide
    // and general, so if that scope is ever unreachable the suggestions list
    // is empty for every real business.
    const federalGeneral = {region: '', industry: GENERAL_INDUSTRY};
    for (const state of US_STATES) {
      for (const industry of INDUSTRIES) {
        expect(coveringScopes(state.value, industry.value)).toContainEqual(federalGeneral);
      }
    }
  });

  it('does not repeat a scope for a country-wide or general business', () => {
    expect(coveringScopes('', GENERAL_INDUSTRY)).toEqual([{region: '', industry: GENERAL_INDUSTRY}]);
    expect(coveringScopes('', 'Retail')).toEqual([
      {region: '', industry: 'Retail'},
      {region: '', industry: GENERAL_INDUSTRY},
    ]);
    expect(coveringScopes('TX', GENERAL_INDUSTRY)).toEqual([
      {region: 'TX', industry: GENERAL_INDUSTRY},
      {region: '', industry: GENERAL_INDUSTRY},
    ]);
  });

  it('puts the most specific scope first', () => {
    const [first] = coveringScopes('NY', 'Retail');
    expect(first).toEqual({region: 'NY', industry: 'Retail'});
  });
});
