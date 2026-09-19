import {mutation, query} from './_generated/server';
import {v} from 'convex/values';
import {requireIdentity, requireBusinessOwner} from './auth';
import {validateProfile, type BusinessProfile} from '../src/jurisdictions';

const business = v.object({
  _id: v.id('businesses'),
  _creationTime: v.number(),
  name: v.string(),
  country: v.string(),
  region: v.string(),
  industry: v.string(),
  locality: v.optional(v.string()),
  entityType: v.optional(v.string()),
  ownerId: v.optional(v.string()),
  ownerToken: v.optional(v.string()),
});

export const create = mutation({
  args: {name: v.string(), country: v.string(), region: v.string(), industry: v.string(), locality: v.optional(v.string()), entityType: v.optional(v.string())},
  returns: v.id('businesses'),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    validateProfile(args as BusinessProfile);
    const existing = await ctx.db
      .query('businesses')
      .withIndex('by_ownerId', q => q.eq('ownerId', identity.subject))
      .take(1);
    if (existing[0]) return existing[0]._id;
    return ctx.db.insert('businesses', {...args, ownerId: identity.subject});
  },
});

/**
 * The current owner's business, or null.
 *
 * This deliberately returns null instead of throwing when there is no session.
 * It is the query the app subscribes to on launch, before the native auth
 * bridge has produced a token; throwing here would leave the whole UI parked in
 * a permanent error state rather than on the sign-in path. It still fails
 * closed: no identity means no data.
 */
export const getByOwner = query({
  args: {},
  returns: v.union(business, v.null()),
  handler: async ctx => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return (
      (await ctx.db
        .query('businesses')
        .withIndex('by_ownerId', q => q.eq('ownerId', identity.subject))
        .take(1))[0] ?? null
    );
  },
});

export const updateProfile = mutation({
  args: {businessId: v.id('businesses'), name: v.string(), country: v.string(), region: v.string(), industry: v.string(), locality: v.optional(v.string()), entityType: v.optional(v.string())},
  returns: v.null(),
  handler: async (ctx, {businessId, ...profile}) => {
    await requireBusinessOwner(ctx, businessId);
    validateProfile(profile as BusinessProfile);
    await ctx.db.patch(businessId, {...profile, name: profile.name.trim()});
    return null;
  },
});
