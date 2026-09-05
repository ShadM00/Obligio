import Purchases, {LOG_LEVEL, type CustomerInfo, type PurchasesPackage} from 'react-native-purchases';

export const ENTITLEMENT_ID = 'obligio_plus';
export const PRODUCT_IDS = {
  monthly: 'obligio_plus_monthly',
  annual: 'obligio_plus_annual',
} as const;

export function configureBilling(apiKey: string) {
  Purchases.setLogLevel(LOG_LEVEL.INFO);
  Purchases.configure({apiKey});
}

export async function getOfferings() {
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function hasPlusEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}
