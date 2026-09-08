import {internalQuery} from './_generated/server';
import {v} from 'convex/values';
import {todayIso} from './dates';

/**
 * Operator view of the rules catalogue.
 *
 * `reviewedAt` records that a person checked an entry against its authority on
 * a given date. That is the whole basis for showing it to an owner, and it
 * decays: filing deadlines and thresholds change, so an entry reviewed two
 * years ago is a claim nobody has stood behind recently.
 *
 * Nothing surfaced that. This is what makes a review — the first one, or a
 * later re-check — something you can actually sit down and do:
 *
 *     npx convex run catalogue:review --prod
 *     npx convex run catalogue:review '{"staleAfterDays":180}' --prod
 *
 * Internal, like the seed mutations: the catalogue is reference data the app
 * reads through `rules.listTemplates`, and this is the operator's side of it.
 */
export const review = internalQuery({
  args: {staleAfterDays: v.optional(v.number())},
  returns: v.object({
    total: v.number(),
    stale: v.number(),
    staleAfterDays: v.number(),
    scopes: v.array(
      v.object({
        scope: v.string(),
        count: v.number(),
        entries: v.array(
          v.object({
            title: v.string(),
            category: v.string(),
            sourceName: v.string(),
            sourceUrl: v.string(),
            reviewedAt: v.string(),
            ageDays: v.number(),
            stale: v.boolean(),
          }),
        ),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const staleAfterDays = args.staleAfterDays ?? 365;
    const today = Date.parse(todayIso());
    const rows = await ctx.db.query('rules').collect();

    const byScope = new Map<string, typeof rows>();
    for (const row of rows) {
      const scope = `${row.country} / ${row.region || '(country-wide)'} / ${row.industry}`;
      byScope.set(scope, [...(byScope.get(scope) ?? []), row]);
    }

    let stale = 0;
    const scopes = [...byScope.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([scope, entries]) => ({
        scope,
        count: entries.length,
        entries: entries
          .map(row => {
            const ageDays = Math.floor((today - Date.parse(row.reviewedAt)) / 86_400_000);
            const isStale = ageDays > staleAfterDays;
            if (isStale) {
              stale += 1;
            }
            return {
              title: row.title,
              category: row.category,
              sourceName: row.sourceName,
              sourceUrl: row.sourceUrl,
              reviewedAt: row.reviewedAt,
              ageDays,
              stale: isStale,
            };
          })
          .sort((a, b) => b.ageDays - a.ageDays),
      }));

    return {total: rows.length, stale, staleAfterDays, scopes};
  },
});
