import {query} from './_generated/server';
import {v} from 'convex/values';

export const listTemplates = query({
  args: {country: v.string(), region: v.string(), industry: v.string()},
  returns: v.array(v.object({_id:v.id('rules'),_creationTime:v.number(),category:v.string(),title:v.string(),description:v.string(),sourceName:v.string(),sourceUrl:v.string(),effectiveFrom:v.string(),reviewedAt:v.string(),recurrence:v.optional(v.string())})),
  handler: async (ctx, args) => ctx.db.query('rules').withIndex('by_jurisdiction_and_industry', q => q.eq('country', args.country).eq('region', args.region).eq('industry', args.industry)).take(100),
});
