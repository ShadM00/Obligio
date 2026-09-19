jest.mock('../convex/_generated/server', () => ({
  mutation: (definition: {handler: unknown}) => definition,
  query: (definition: {handler: unknown}) => definition,
}));

import {attach} from '../convex/documents';

const replace = (attach as unknown as {handler: (ctx: unknown, args: unknown) => Promise<null>}).handler;

function context(owner = 'reviewer', oldFile: string | undefined = 'old-file') {
  return {
    auth: {getUserIdentity: jest.fn(async () => ({subject: 'reviewer'}))},
    db: {
      get: jest.fn(async (id: string) => id === 'requirement'
        ? {businessId: 'business', documentStorageId: oldFile}
        : {ownerId: owner}),
      patch: jest.fn(async () => undefined),
    },
    storage: {delete: jest.fn(async () => undefined)},
  };
}

it('removes superseded evidence so account deletion cannot leave it behind', async () => {
  const ctx = context();
  await replace(ctx, {requirementId: 'requirement', documentStorageId: 'new-file'});
  expect(ctx.storage.delete).toHaveBeenCalledWith('old-file');
  expect(ctx.db.patch).toHaveBeenCalledWith('requirement', {documentStorageId: 'new-file'});
});

it('preserves the attached file when an upload attachment request is retried', async () => {
  const ctx = context();
  await replace(ctx, {requirementId: 'requirement', documentStorageId: 'old-file'});
  expect(ctx.storage.delete).not.toHaveBeenCalled();
});

it('does not delete or replace another account’s evidence', async () => {
  const ctx = context('another-owner');
  await expect(replace(ctx, {requirementId: 'requirement', documentStorageId: 'new-file'}))
    .rejects.toThrow('Business not found');
  expect(ctx.storage.delete).not.toHaveBeenCalled();
  expect(ctx.db.patch).not.toHaveBeenCalled();
});

it('does not replace the link when deleting the old file fails', async () => {
  const ctx = context();
  ctx.storage.delete.mockRejectedValueOnce(new Error('storage unavailable'));
  await expect(replace(ctx, {requirementId: 'requirement', documentStorageId: 'new-file'}))
    .rejects.toThrow('storage unavailable');
  expect(ctx.db.patch).not.toHaveBeenCalled();
});
