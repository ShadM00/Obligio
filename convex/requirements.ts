import { query } from './_generated/server';
import { v } from 'convex/values';
import { requireBusinessOwner } from './auth';
import { statusForDueDate, todayIso } from './dates';

const requirement = v.object({
  _id: v.id('requirements'),
  title: v.string(),
  category: v.string(),
  dueDate: v.string(),
  status: v.union(
    v.literal('current'),
    v.literal('upcoming'),
    v.literal('overdue'),
  ),
  recurrence: v.optional(v.string()),
  authorityUrl: v.optional(v.string()),
  hasDocument: v.boolean(),
});

export const list = query({
  args: { businessId: v.id('businesses') },
  returns: v.array(requirement),
  handler: async (ctx, args) => {
    await requireBusinessOwner(ctx, args.businessId);
    const rows = await ctx.db
      .query('requirements')
      .withIndex('by_businessId_and_dueDate', q =>
        q.eq('businessId', args.businessId),
      )
      .take(100);
    const today = todayIso();
    return rows.map(row => {
      // Overdue is derived, not stored. A requirement saved as `upcoming`
      // becomes overdue the day its date passes, with no scheduled job to run
      // and nothing to drift. `current` is an explicit act by the owner, so it
      // is the one status that is never recomputed.
      const status: 'current' | 'upcoming' | 'overdue' =
        row.status === 'current'
          ? 'current'
          : statusForDueDate(row.dueDate, today);
      return {
        _id: row._id,
        title: row.title,
        category: row.category,
        dueDate: row.dueDate,
        status,
        recurrence: row.recurrence,
        authorityUrl: row.authorityUrl,
        // The storage id itself stays server-side; the client only needs to know
        // whether evidence is attached.
        hasDocument: Boolean(row.documentStorageId),
      };
    });
  },
});
