import type {GenericMutationCtx, GenericQueryCtx} from 'convex/server';
import type {DataModel} from './_generated/dataModel';
import type {Id} from './_generated/dataModel';

type AuthCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;
export async function requireIdentity(ctx: AuthCtx) { const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error('Authentication required'); return identity; }
export async function requireBusinessOwner(ctx: AuthCtx, businessId: Id<'businesses'>) { const identity = await requireIdentity(ctx); const business = await ctx.db.get(businessId); if (!business || !('ownerId' in business) || business.ownerId !== identity.subject) throw new Error('Business not found'); return {identity, business}; }
