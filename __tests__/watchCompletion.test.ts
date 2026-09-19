jest.mock('../convex/_generated/server', () => ({mutation: (definition: {handler: unknown}) => definition}));
import {completeAndScheduleNext} from '../convex/recurrence';
const complete = (completeAndScheduleNext as unknown as {handler: (ctx: unknown, args: unknown) => Promise<unknown>}).handler;
function context(owner = 'owner1') {
  const row = {businessId: 'business1', title: 'Renew', category: 'Other', dueDate: '2026-10-01', recurrence: 'monthly', status: 'upcoming'};
  return {
    auth: {getUserIdentity: jest.fn(async () => ({subject: 'owner1'}))},
    db: {
      get: jest.fn(async (id: string) => id === 'req1' ? row : {ownerId: owner}),
      patch: jest.fn(async (_id: string, patch: Partial<typeof row>) => { Object.assign(row, patch); }),
      insert: jest.fn(async () => 'next'),
    },
  };
}
it('a retried completion creates only one next cycle', async () => {
  const ctx = context();
  await complete(ctx, {requirementId: 'req1'});
  await complete(ctx, {requirementId: 'req1'});
  expect(ctx.db.insert).toHaveBeenCalledTimes(1);
  expect(ctx.db.insert).toHaveBeenCalledWith('requirements', expect.objectContaining({dueDate: '2026-11-01'}));
});
it('a watch cannot complete another owner’s obligation', async () => {
  const ctx = context('other');
  await expect(complete(ctx, {requirementId: 'req1'})).rejects.toThrow('Business not found');
  expect(ctx.db.patch).not.toHaveBeenCalled();
});
