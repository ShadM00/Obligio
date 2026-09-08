import {mutation} from './_generated/server';
import {v} from 'convex/values';
import {requireIdentity} from './auth';

/**
 * Deletes the signed-in owner's businesses and everything hanging off them.
 *
 * Google Play expects an account-deletion route that is not "email us", and
 * an owner who wants their compliance history gone should not have to ask for
 * it. The mutation is scoped to the caller's own `ownerId`: it never takes a
 * business id, so it cannot be pointed at someone else's data.
 *
 * Stored evidence is deleted alongside the rows that reference it, because a
 * file in Convex storage outlives the requirement pointing at it and would
 * otherwise be orphaned where nothing can reach or remove it.
 *
 * The deleted requirement ids come back so the client can cancel their local
 * reminders. Notifications live on the device, not here, so a deletion that
 * did not report them would leave a phone buzzing about obligations that no
 * longer exist.
 *
 * This does not cancel a subscription. Apple and Google own that billing
 * relationship, and neither lets an app end it on the user's behalf -- the
 * caller is responsible for telling the owner so.
 */
export const deleteAccount = mutation({
  args: {},
  returns: v.object({
    businesses: v.number(),
    requirements: v.number(),
    documents: v.number(),
    requirementIds: v.array(v.string()),
  }),
  handler: async ctx => {
    const identity = await requireIdentity(ctx);

    const businesses = await ctx.db
      .query('businesses')
      .withIndex('by_ownerId', q => q.eq('ownerId', identity.subject))
      .collect();

    const requirementIds: string[] = [];
    let requirements = 0;
    let documents = 0;

    for (const business of businesses) {
      const rows = await ctx.db
        .query('requirements')
        .withIndex('by_businessId', q => q.eq('businessId', business._id))
        .collect();

      for (const row of rows) {
        if (row.documentStorageId) {
          await ctx.storage.delete(row.documentStorageId);
          documents += 1;
        }
        requirementIds.push(row._id);
        await ctx.db.delete(row._id);
        requirements += 1;
      }

      await ctx.db.delete(business._id);
    }

    return {businesses: businesses.length, requirements, documents, requirementIds};
  },
});
