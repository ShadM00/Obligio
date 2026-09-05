import {mutation, query} from './_generated/server';
import {v} from 'convex/values';
import {requireIdentity} from './auth';
const business = v.object({_id: v.id('businesses'), _creationTime: v.number(), name: v.string(), country: v.string(), region: v.string(), industry: v.string(), ownerId: v.optional(v.string()), ownerToken: v.optional(v.string())});
export const create = mutation({args: {name: v.string(), country: v.string(), region: v.string(), industry: v.string()}, returns: v.id('businesses'), handler: async (ctx, args) => { const identity = await requireIdentity(ctx); return ctx.db.insert('businesses', {...args, ownerId: identity.subject}); }});
export const getByOwner = query({args: {}, returns: v.union(business, v.null()), handler: async ctx => { const identity = await requireIdentity(ctx); return (await ctx.db.query('businesses').withIndex('by_ownerId', q => q.eq('ownerId', identity.subject)).take(1))[0] ?? null; }});
