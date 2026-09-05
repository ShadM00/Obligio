import {mutation} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner} from './auth';
import {assertIsoDate, assertRecurrence} from './dates';

const status = v.union(v.literal('current'), v.literal('upcoming'), v.literal('overdue'));

export const create = mutation({
  args: {
    businessId: v.id('businesses'),
    title: v.string(),
    category: v.string(),
    dueDate: v.string(),
    recurrence: v.optional(v.string()),
    status,
  },
  returns: v.id('requirements'),
  handler: async (ctx, args) => {
    await requireBusinessOwner(ctx, args.businessId);
    assertIsoDate(args.dueDate);
    if (args.recurrence !== undefined) assertRecurrence(args.recurrence);
    return ctx.db.insert('requirements', args);
  },
});

export const updateStatus = mutation({
  args: {requirementId: v.id('requirements'), status},
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.requirementId);
    if (!row) throw new Error('Requirement not found');
    await requireBusinessOwner(ctx, row.businessId);
    await ctx.db.patch(args.requirementId, {status: args.status});
    return null;
  },
});

export const remove = mutation({
  args: {requirementId: v.id('requirements')},
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.requirementId);
    if (!row) return null;
    await requireBusinessOwner(ctx, row.businessId);
    if (row.documentStorageId) await ctx.storage.delete(row.documentStorageId);
    await ctx.db.delete(args.requirementId);
    return null;
  },
});
