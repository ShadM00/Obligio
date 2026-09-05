import {query} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner} from './auth';

const requirement = v.object({
  _id: v.id('requirements'),
  title: v.string(),
  category: v.string(),
  dueDate: v.string(),
  status: v.union(v.literal('current'), v.literal('upcoming'), v.literal('overdue')),
  recurrence: v.optional(v.string()),
  authorityUrl: v.optional(v.string()),
  hasDocument: v.boolean(),
});

export const list = query({
  args: {businessId: v.id('businesses')},
  returns: v.array(requirement),
  handler: async (ctx, args) => {
    await requireBusinessOwner(ctx, args.businessId);
    const rows = await ctx.db
      .query('requirements')
      .withIndex('by_businessId_and_dueDate', q => q.eq('businessId', args.businessId))
      .take(100);
    return rows.map(row => ({
      _id: row._id,
      title: row.title,
      category: row.category,
      dueDate: row.dueDate,
      status: row.status,
      recurrence: row.recurrence,
      authorityUrl: row.authorityUrl,
      // The storage id itself stays server-side; the client only needs to know
      // whether evidence is attached.
      hasDocument: Boolean(row.documentStorageId),
    }));
  },
});
