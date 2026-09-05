import {query} from './_generated/server';
import {v} from 'convex/values';
import {requireBusinessOwner} from './auth';
export const list = query({args: {businessId: v.id('businesses')}, returns: v.array(v.object({title: v.string(), category: v.string(), dueDate: v.string(), status: v.string()})), handler: async (ctx, args) => { await requireBusinessOwner(ctx, args.businessId); return (await ctx.db.query('requirements').withIndex('by_businessId_and_dueDate', q => q.eq('businessId', args.businessId)).take(100)).map(({title, category, dueDate, status}) => ({title, category, dueDate, status})); }});
