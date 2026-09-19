import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {INTERNATIONAL_RULES} from './catalogueInternational';

/**
 * Brings the rules table in line with the international catalogue: inserts
 * rows it lacks and rewrites rows whose wording or source changed. A row is
 * the same rule when jurisdiction, industry, locality and title match. A
 * retitled rule names its old title in `replaces`, and the row is renamed in
 * place rather than duplicated.
 */
export const seed = internalMutation({
  args: {},
  returns: v.object({inserted: v.number(), updated: v.number(), unchanged: v.number()}),
  handler: async ctx => {
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;
    for (const {reviewedAt = '2026-09-18', replaces, ...rule} of INTERNATIONAL_RULES) {
      const existing = await ctx.db.query('rules').withIndex('by_jurisdiction_and_industry', q => q.eq('country', rule.country).eq('region', rule.region).eq('industry', rule.industry)).take(100);
      const row =
        existing.find(candidate => candidate.title === rule.title && candidate.locality === rule.locality) ??
        existing.find(candidate => replaces !== undefined && candidate.title === replaces && candidate.locality === rule.locality);
      if (!row) {
        // effectiveFrom is the catalogue publication date, not a claimed statutory commencement date.
        await ctx.db.insert('rules', {...rule, reviewedAt, effectiveFrom: reviewedAt});
        inserted++;
        continue;
      }
      const changed = row.title !== rule.title || row.description !== rule.description || row.sourceName !== rule.sourceName || row.sourceUrl !== rule.sourceUrl || row.category !== rule.category || row.recurrence !== rule.recurrence || JSON.stringify(row.entityTypes) !== JSON.stringify(rule.entityTypes);
      if (!changed) {unchanged++; continue;}
      await ctx.db.patch(row._id, {title: rule.title, description: rule.description, sourceName: rule.sourceName, sourceUrl: rule.sourceUrl, category: rule.category, recurrence: rule.recurrence, entityTypes: rule.entityTypes, reviewedAt});
      updated++;
    }
    return {inserted, updated, unchanged};
  },
});
