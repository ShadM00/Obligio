import Purchases, {LOG_LEVEL, type CustomerInfo, type PurchasesPackage} from 'react-native-purchases';
import {revenueCatApiKey} from './config';

export const ENTITLEMENT_ID = 'obligio_plus';

/**
 * Store product identifiers are deliberately not declared here.
 *
 * They are not the same across platforms: App Store products are
 * `obligio_plus_monthly` and `obligio_plus_annual`, while Google Play
 * identifies a purchasable thing as `<product>:<base_plan>`, giving
 * `obligio_plus_monthly:monthly` and `obligio_plus_annual:annual`. Any code
 * that compared a product id as a string would therefore work on iOS and fail
 * on Android.
 *
 * Select by package instead — `$rc_monthly` and `$rc_annual` are the same on
 * both stores, and RevenueCat resolves each to the right product. The paywall
 * does this through `PurchasesPackage.identifier`.
 */

let configured = false;
let billingUserId: string | null = null;
let requestedUserId: string | null = null;
let identityTransition: Promise<void> = Promise.resolve();

/** Serialize SDK identity changes so a late login cannot restore an old account. */
export function identifyBillingUser(userId: string | null): Promise<void> {
  requestedUserId = userId;
  billingUserId = null;
  identityTransition = identityTransition.catch(() => {}).then(async () => {
    if (!configureBilling()) return;
    if (userId) {
      await Purchases.logIn(userId);
    } else if (!(await Purchases.isAnonymous())) {
      await Purchases.logOut();
    }
    billingUserId = userId;
  });
  return identityTransition;
}

export function isBillingUserReady(userId: string): boolean {
  return requestedUserId === userId && billingUserId === userId;
}

async function requireIdentifiedUser() {
  requireConfigured();
  await identityTransition;
  if (!requestedUserId || billingUserId !== requestedUserId) {
    throw new Error('Sign in and wait for your subscription to load before continuing.');
  }
}


/** True once a store key is present and the SDK has been configured. */
export function isBillingAvailable(): boolean {
  return revenueCatApiKey !== null;
}

/**
 * Configures RevenueCat once per app session. Returns false when no store key
 * is set for this platform, which lets the paywall explain that plans are
 * unavailable instead of throwing at the SDK boundary.
 */
export function configureBilling(apiKey: string | null = revenueCatApiKey): boolean {
  if (configured) return true;
  if (!apiKey) return false;
  Purchases.setLogLevel(LOG_LEVEL.INFO);
  Purchases.configure({apiKey});
  configured = true;
  return true;
}

function requireConfigured() {
  if (!configureBilling()) {
    throw new Error('Subscriptions are not available in this build.');
  }
}

/** The packages in the current offering, or an empty list when unavailable. */
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  requireConfigured();
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function getOfferings() {
  requireConfigured();
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  await requireIdentifiedUser();
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  await requireIdentifiedUser();
  return Purchases.restorePurchases();
}

export function hasPlusEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}
