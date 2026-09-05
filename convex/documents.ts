import {mutation, query} from './_generated/server';
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

/**
 * A short-lived URL for a requirement's attached evidence.
 *
 * The storage id never leaves the server; the client asks for a URL by
 * requirement and only gets one if it owns the business. Returns null when
 * nothing is attached, which is not an error.
 */
export const getEvidenceUrl = query({
  args: {requirementId: v.id('requirements')},
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.requirementId);
    if (!row) return null;
    await requireBusinessOwner(ctx, row.businessId);
    if (!row.documentStorageId) return null;
    return ctx.storage.getUrl(row.documentStorageId);
  },
});

/** Removes attached evidence and deletes the stored file. */
export const detach = mutation({
  args: {requirementId: v.id('requirements')},
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.requirementId);
    if (!row) return null;
    await requireBusinessOwner(ctx, row.businessId);
    if (row.documentStorageId) await ctx.storage.delete(row.documentStorageId);
    await ctx.db.patch(args.requirementId, {documentStorageId: undefined});
    return null;
  },
});
