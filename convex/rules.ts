import {query} from './_generated/server';
import {v} from 'convex/values';
import {requireIdentity} from './auth';
import {coveringScopes} from '../src/jurisdictions';

/**
 * Reference rules for a jurisdiction and industry. The catalogue is shared
 * across tenants rather than owned by one business, so it is gated on a valid
 * session rather than on business ownership.
 */
export const listTemplates = query({
  args: {country: v.string(), region: v.string(), industry: v.string()},
  returns: v.array(
    v.object({
      _id: v.id('rules'),
      _creationTime: v.number(),
      category: v.string(),
      title: v.string(),
      description: v.string(),
      sourceName: v.string(),
      sourceUrl: v.string(),
      effectiveFrom: v.string(),
      reviewedAt: v.string(),
      recurrence: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireIdentity(ctx);

    // A rule row is scoped as narrowly as it applies: federal rules are
    // stored with an empty region, rules for any trade with industry
    // 'General'. The index matches all three fields exactly, so asking only
    // for the business's own triple finds nothing for almost every business
    // -- a shop in (US, WA, FoodService) would never see Form 941, which
    // applies to it. Widen to every scope that covers this business.
    const scopes = coveringScopes(args.region, args.industry);

    const seen = new Set<string>();
    const templates = [];
    for (const scope of scopes) {
      const rows = await ctx.db
        .query('rules')
        .withIndex('by_jurisdiction_and_industry', q =>
          q.eq('country', args.country).eq('region', scope.region).eq('industry', scope.industry),
        )
        .take(100);
      for (const row of rows) {
        // The scopes overlap whenever the business is itself country-wide or
        // general, so the same row can come back more than once.
        if (seen.has(row._id)) {
          continue;
        }
        seen.add(row._id);
        // Projected field by field rather than returned whole: the row also
        // carries country, region and industry, which the returns validator
        // above does not declare.
        templates.push({
          _id: row._id,
          _creationTime: row._creationTime,
          category: row.category,
          title: row.title,
          description: row.description,
          sourceName: row.sourceName,
          sourceUrl: row.sourceUrl,
          effectiveFrom: row.effectiveFrom,
          reviewedAt: row.reviewedAt,
          recurrence: row.recurrence,
        });
      }
    }
    return templates.slice(0, 100);
  },
});
