/**
 * What a free account may do.
 *
 * Deliberately free of platform imports: this is pricing policy, and it should
 * be readable and testable without pulling in RevenueCat or React Native.
 * `src/subscription.ts` supplies the live entitlement state; this module
 * decides what that state permits.
 */

/**
 * How many obligations a free account may track.
 *
 * Competitors in this category give one or two items free before charging.
 * Three is deliberately a little more generous: a compliance tracker only
 * feels useful once it holds enough to look like a real picture.
 *
 * This is a pricing decision, not a technical one — change the number here.
 */
export const FREE_REQUIREMENT_LIMIT = 3;

/** Whether another obligation may be added. */
export function canAddRequirement(isPlus: boolean, current: number): boolean {
  return isPlus || current < FREE_REQUIREMENT_LIMIT;
}

/** Attaching document evidence is part of Obligio Plus. */
export function canAttachEvidence(isPlus: boolean): boolean {
  return isPlus;
}

/** Recurring obligations are part of Obligio Plus; one-off is always free. */
export function canUseRecurrence(isPlus: boolean): boolean {
  return isPlus;
}
