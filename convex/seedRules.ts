import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {assertIsoDate} from './dates';

/**
 * Seeds the jurisdiction rules catalogue.
 *
 * This is operator tooling, not a client capability: the rules table is shared
 * reference data, so an internal mutation keeps it reachable from the Convex
 * dashboard and from other Convex functions while remaining unreachable from
 * the app (and from anyone who knows the deployment URL).
 */
export const addTemplate = internalMutation({
  args: {
    country: v.string(),
    region: v.string(),
    industry: v.string(),
    category: v.string(),
    title: v.string(),
    description: v.string(),
    sourceName: v.string(),
    sourceUrl: v.string(),
    effectiveFrom: v.string(),
    reviewedAt: v.string(),
    recurrence: v.optional(v.string()),
  },
  returns: v.id('rules'),
  handler: async (ctx, args) => {
    assertIsoDate(args.effectiveFrom, 'effectiveFrom');
    assertIsoDate(args.reviewedAt, 'reviewedAt');
    return ctx.db.insert('rules', args);
  },
});
