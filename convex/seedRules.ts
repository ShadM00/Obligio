import {mutation} from './_generated/server';
import {v} from 'convex/values';

export const addTemplate = mutation({
  args: {country:v.string(),region:v.string(),industry:v.string(),category:v.string(),title:v.string(),description:v.string(),sourceName:v.string(),sourceUrl:v.string(),effectiveFrom:v.string(),reviewedAt:v.string(),recurrence:v.optional(v.string())},
  returns:v.id('rules'),
  handler:async (ctx,args)=>ctx.db.insert('rules',args),
});
