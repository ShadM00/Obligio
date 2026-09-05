import {mutation} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner, requireIdentity} from './auth';

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async ctx => { await requireIdentity(ctx); return ctx.storage.generateUploadUrl(); },
});

export const attach = mutation({
  args: {requirementId: v.id('requirements'), documentStorageId: v.id('_storage')},
  returns: v.null(),
  handler: async (ctx, args) => { const row = await ctx.db.get(args.requirementId); if (!row) throw new Error('Requirement not found'); await requireBusinessOwner(ctx, row.businessId); await ctx.db.patch(args.requirementId, {documentStorageId: args.documentStorageId}); return null; },
});
