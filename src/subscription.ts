import {useCallback, useEffect, useState} from 'react';
import Purchases from 'react-native-purchases';
import {ENTITLEMENT_ID, configureBilling, isBillingAvailable} from './billing';

export {FREE_REQUIREMENT_LIMIT, canAddRequirement, canAttachEvidence, canUseRecurrence} from './entitlements';

export type Subscription = {
  /** True when the customer holds the entitlement, or gating does not apply. */
  isPlus: boolean;
  /** Still determining. Treated as not-Plus so nothing unlocks by accident. */
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Whether this customer has Obligio Plus.
 *
 * A build with no store key cannot sell anything, so gating it would leave
 * features permanently unreachable with no way to buy them. Those builds are
 * treated as unrestricted. Production always carries a key, so this never
 * relaxes a real customer's limits.
 *
 * The check is client-side. It decides what the UI offers, not what the
 * backend permits — see docs/release.md.
 */
export function useSubscription(): Subscription {
  const gated = isBillingAvailable();
  const [isPlus, setIsPlus] = useState(!gated);
  const [loading, setLoading] = useState(gated);

  const refresh = useCallback(async () => {
    if (!gated) return;
    try {
      if (!configureBilling()) return;
      const info = await Purchases.getCustomerInfo();
      setIsPlus(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
    } catch {
      // A failed lookup must not silently unlock Plus.
      setIsPlus(false);
    } finally {
      setLoading(false);
    }
  }, [gated]);

  useEffect(() => {
    refresh();
    if (!gated) return undefined;
    // Purchases, restores, renewals and expiries all arrive here, so the UI
    // unlocks the moment a purchase completes without a manual refresh.
    const listener = (info: Parameters<Parameters<typeof Purchases.addCustomerInfoUpdateListener>[0]>[0]) => {
      setIsPlus(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
      setLoading(false);
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [gated, refresh]);

  return {isPlus, loading, refresh};
}
