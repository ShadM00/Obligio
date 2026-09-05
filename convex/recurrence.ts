import {mutation} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner} from './auth';
import {nextDueDate} from './dates';

/**
 * Marks a requirement satisfied and, when it repeats, opens the next cycle.
 * Returns the id of the newly scheduled requirement, or null when the
 * requirement was one-off.
 */
export const completeAndScheduleNext = mutation({
  args: {requirementId: v.id('requirements')},
  returns: v.union(v.id('requirements'), v.null()),
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.requirementId);
    if (!current) return null;
    await requireBusinessOwner(ctx, current.businessId);
    await ctx.db.patch(args.requirementId, {status: 'current'});
    if (!current.recurrence) return null;
    return ctx.db.insert('requirements', {
      businessId: current.businessId,
      title: current.title,
      category: current.category,
      dueDate: nextDueDate(current.dueDate, current.recurrence),
      recurrence: current.recurrence,
      status: 'upcoming',
      authorityUrl: current.authorityUrl,
    });
  },
});
