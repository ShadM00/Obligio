import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {INTERNATIONAL_RULES} from './catalogueInternational';
export const seed = internalMutation({
  args: {},
  returns: v.object({inserted: v.number(), skipped: v.number()}),
  handler: async ctx => {
    let inserted = 0;
    let skipped = 0;
    for (const rule of INTERNATIONAL_RULES) {
      const existing = await ctx.db.query('rules').withIndex('by_jurisdiction_and_industry', q => q.eq('country', rule.country).eq('region', rule.region).eq('industry', rule.industry)).take(100);
      if (existing.some(row => row.title === rule.title && row.locality === rule.locality)) {skipped++; continue;}
      // effectiveFrom is the catalogue publication date, not a claimed statutory commencement date.
      await ctx.db.insert('rules', {...rule, reviewedAt: '2026-09-18', effectiveFrom: '2026-09-18'});
      inserted++;
    }
    return {inserted, skipped};
  },
});
