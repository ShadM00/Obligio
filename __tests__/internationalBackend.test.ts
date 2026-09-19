jest.mock('../convex/_generated/server', () => ({mutation: (definition: {handler: unknown}) => definition, query: (definition: {handler: unknown}) => definition}));
import {createFromTemplate} from '../convex/requirementsMutations';
import {updateProfile} from '../convex/businesses';
const adopt = (createFromTemplate as unknown as {handler: (ctx: unknown, args: unknown) => Promise<unknown>}).handler;
const update = (updateProfile as unknown as {handler: (ctx: unknown, args: unknown) => Promise<unknown>}).handler;
function context(ruleCountry = 'AU', owner = 'owner') {
  return {auth: {getUserIdentity: async () => ({subject: 'owner'})}, db: {
    get: jest.fn(async (id: string) => id === 'business' ? {ownerId: owner, country: 'AU', region: 'WA', industry: 'General', entityType: 'company'} : {country: ruleCountry, region: '', industry: 'General', title: 'Review', category: 'Registration', sourceUrl: 'https://www.asic.gov.au', recurrence: 'annual', entityTypes: ['company']}),
    insert: jest.fn(async () => 'created'), patch: jest.fn(async () => undefined),
  }};
}
it('rejects adopting foreign templates even if called directly', async () => {
  const ctx = context('GB');
  await expect(adopt(ctx, {businessId: 'business', ruleId: 'rule', dueDate: '2026-12-01'})).rejects.toThrow('does not match');
  expect(ctx.db.insert).not.toHaveBeenCalled();
});
it('accepts matching rules and preserves official source', async () => {
  const ctx = context();
  await adopt(ctx, {businessId: 'business', ruleId: 'rule', dueDate: '2026-12-01'});
  expect(ctx.db.insert).toHaveBeenCalledWith('requirements', expect.objectContaining({authorityUrl: 'https://www.asic.gov.au', dueDate: '2026-12-01'}));
});
it('profile changes require ownership', async () => {
  const ctx = context('AU', 'someone-else');
  await expect(update(ctx, {businessId: 'business', name: 'Test', country: 'AU', region: 'WA', industry: 'General'})).rejects.toThrow('Business not found');
  expect(ctx.db.patch).not.toHaveBeenCalled();
});
it('changing jurisdiction leaves existing obligations untouched', async () => {
  const ctx = context();
  await update(ctx, {businessId: 'business', name: 'Test', country: 'CA', region: 'ON', industry: 'General', entityType: 'federalCorporation'});
  expect(ctx.db.patch).toHaveBeenCalledTimes(1);
  expect(ctx.db.patch).toHaveBeenCalledWith('business', expect.objectContaining({country: 'CA'}));
  expect(ctx.db.insert).not.toHaveBeenCalled();
});
