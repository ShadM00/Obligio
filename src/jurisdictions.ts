/**
 * The jurisdiction and industry vocabulary the rules catalogue is keyed on.
 *
 * `convex/rules.ts` indexes templates by (country, region, industry), so these
 * values are the contract between what an owner picks during onboarding and
 * what the catalogue can match. Keep them stable; changing a label is safe,
 * changing a value orphans every rule row that used it.
 */

export type Country = 'US' | 'GB';

/**
 * The countries onboarding offers.
 *
 * Only jurisdictions whose catalogue has actually been written and reviewed
 * belong here: every entry is a promise that "Suggested for you" has something
 * to say, and a compliance app that guesses is worse than one that stays
 * quiet. GB keeps its type, regions and copy below so adding it back is the
 * one-line change it should be -- what it lacks is a reviewed catalogue, not
 * code.
 *
 * The en-US/en-GB toggle is separate and unaffected: it drives date format and
 * spelling, not which rules apply.
 */
export const COUNTRIES: {value: Country; label: string}[] = [
  {value: 'US', label: 'United States'},
];

/** Empty region means "applies country-wide". */
export const US_STATES: {value: string; label: string}[] = [
  {value: '', label: 'Federal only'},
  {value: 'AL', label: 'Alabama'}, {value: 'AK', label: 'Alaska'}, {value: 'AZ', label: 'Arizona'},
  {value: 'AR', label: 'Arkansas'}, {value: 'CA', label: 'California'}, {value: 'CO', label: 'Colorado'},
  {value: 'CT', label: 'Connecticut'}, {value: 'DE', label: 'Delaware'}, {value: 'DC', label: 'District of Columbia'},
  {value: 'FL', label: 'Florida'}, {value: 'GA', label: 'Georgia'}, {value: 'HI', label: 'Hawaii'},
  {value: 'ID', label: 'Idaho'}, {value: 'IL', label: 'Illinois'}, {value: 'IN', label: 'Indiana'},
  {value: 'IA', label: 'Iowa'}, {value: 'KS', label: 'Kansas'}, {value: 'KY', label: 'Kentucky'},
  {value: 'LA', label: 'Louisiana'}, {value: 'ME', label: 'Maine'}, {value: 'MD', label: 'Maryland'},
  {value: 'MA', label: 'Massachusetts'}, {value: 'MI', label: 'Michigan'}, {value: 'MN', label: 'Minnesota'},
  {value: 'MS', label: 'Mississippi'}, {value: 'MO', label: 'Missouri'}, {value: 'MT', label: 'Montana'},
  {value: 'NE', label: 'Nebraska'}, {value: 'NV', label: 'Nevada'}, {value: 'NH', label: 'New Hampshire'},
  {value: 'NJ', label: 'New Jersey'}, {value: 'NM', label: 'New Mexico'}, {value: 'NY', label: 'New York'},
  {value: 'NC', label: 'North Carolina'}, {value: 'ND', label: 'North Dakota'}, {value: 'OH', label: 'Ohio'},
  {value: 'OK', label: 'Oklahoma'}, {value: 'OR', label: 'Oregon'}, {value: 'PA', label: 'Pennsylvania'},
  {value: 'RI', label: 'Rhode Island'}, {value: 'SC', label: 'South Carolina'}, {value: 'SD', label: 'South Dakota'},
  {value: 'TN', label: 'Tennessee'}, {value: 'TX', label: 'Texas'}, {value: 'UT', label: 'Utah'},
  {value: 'VT', label: 'Vermont'}, {value: 'VA', label: 'Virginia'}, {value: 'WA', label: 'Washington'},
  {value: 'WV', label: 'West Virginia'}, {value: 'WI', label: 'Wisconsin'}, {value: 'WY', label: 'Wyoming'},
];

export const GB_REGIONS: {value: string; label: string}[] = [
  {value: '', label: 'UK-wide'},
  {value: 'ENG', label: 'England'},
  {value: 'SCT', label: 'Scotland'},
  {value: 'WLS', label: 'Wales'},
  {value: 'NIR', label: 'Northern Ireland'},
];

export function regionsFor(country: Country) {
  return country === 'GB' ? GB_REGIONS : US_STATES;
}

/** Industry value for rules that apply whatever trade a business is in. */
export const GENERAL_INDUSTRY = 'General';

export const INDUSTRIES: {value: string; label: string}[] = [
  {value: 'General', label: 'General business'},
  {value: 'FoodService', label: 'Food & beverage'},
  {value: 'Retail', label: 'Retail'},
  {value: 'Construction', label: 'Construction & trades'},
  {value: 'Healthcare', label: 'Health & care'},
  {value: 'Childcare', label: 'Childcare & education'},
  {value: 'Transport', label: 'Transport & logistics'},
  {value: 'Professional', label: 'Professional services'},
  {value: 'Beauty', label: 'Beauty & personal care'},
  {value: 'Fitness', label: 'Fitness & recreation'},
];

export function labelFor(list: {value: string; label: string}[], value: string): string {
  return list.find(entry => entry.value === value)?.label ?? value;
}

/**
 * Every catalogue scope that covers a business.
 *
 * A rule is stored as narrowly as it applies: federal rules under an empty
 * region, rules for any trade under industry 'General'. `rules.listTemplates`
 * matches country, region and industry exactly, so a business must be looked
 * up under all four combinations or it sees only rules written for its exact
 * state and trade -- and none of the federal ones that apply to everyone.
 *
 * Ordered widest-last so the most specific rules come first, and deduplicated
 * by the caller, since the scopes collapse into each other for a business that
 * is itself country-wide or general.
 */
export function coveringScopes(region: string, industry: string): {region: string; industry: string}[] {
  const scopes = [
    {region, industry},
    {region: '', industry},
    {region, industry: GENERAL_INDUSTRY},
    {region: '', industry: GENERAL_INDUSTRY},
  ];
  return scopes.filter(
    (scope, index) =>
      index === scopes.findIndex(other => other.region === scope.region && other.industry === scope.industry),
  );
}
