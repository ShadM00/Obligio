import {mutation} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner} from './auth';

function nextDate(date: string, recurrence: string) {
  const d = new Date(`${date}T00:00:00Z`);
  if (recurrence === 'monthly') d.setUTCMonth(d.getUTCMonth() + 1);
  else if (recurrence === 'quarterly') d.setUTCMonth(d.getUTCMonth() + 3);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

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
      dueDate: nextDate(current.dueDate, current.recurrence),
      recurrence: current.recurrence,
      status: 'upcoming',
      authorityUrl: current.authorityUrl,
    });
  },
});
