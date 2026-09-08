/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as auth from "../auth.js";
import type * as businesses from "../businesses.js";
import type * as dates from "../dates.js";
import type * as documents from "../documents.js";
import type * as recurrence from "../recurrence.js";
import type * as requirements from "../requirements.js";
import type * as requirementsMutations from "../requirementsMutations.js";
import type * as rules from "../rules.js";
import type * as seedRules from "../seedRules.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  auth: typeof auth;
  businesses: typeof businesses;
  dates: typeof dates;
  documents: typeof documents;
  recurrence: typeof recurrence;
  requirements: typeof requirements;
  requirementsMutations: typeof requirementsMutations;
  rules: typeof rules;
  seedRules: typeof seedRules;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
