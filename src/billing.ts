import Purchases, {LOG_LEVEL, type CustomerInfo, type PurchasesPackage} from 'react-native-purchases';
import {revenueCatApiKey} from './config';

export const ENTITLEMENT_ID = 'obligio_plus';
export const PRODUCT_IDS = {
  monthly: 'obligio_plus_monthly',
  annual: 'obligio_plus_annual',
} as const;

let configured = false;

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
  requireConfigured();
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  requireConfigured();
  return Purchases.restorePurchases();
}

export function hasPlusEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}
