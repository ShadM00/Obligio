import {useCallback, useEffect, useState} from 'react';
import Purchases from 'react-native-purchases';
import {ENTITLEMENT_ID, identifyBillingUser, isBillingAvailable, isBillingUserReady} from './billing';

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
export function useSubscription(userId: string | null = null): Subscription {
  const gated = isBillingAvailable();
  const [result, setResult] = useState<{userId: string | null; isPlus: boolean; loading: boolean}>({
    userId: null, isPlus: !gated, loading: gated,
  });

  const refresh = useCallback(async () => {
    if (!gated || !userId) return;
    try {
      await identifyBillingUser(userId);
      const info = await Purchases.getCustomerInfo();
      if (isBillingUserReady(userId)) {
        setResult({userId, isPlus: Boolean(info.entitlements.active[ENTITLEMENT_ID]), loading: false});
      }
    } catch {
      setResult({userId, isPlus: false, loading: false});
    }
  }, [gated, userId]);

  useEffect(() => {
    if (!gated) return;
    let active = true;
    setResult({userId, isPlus: false, loading: Boolean(userId)});
    const sync = async () => {
      try {
        await identifyBillingUser(userId);
        if (!active || !userId) return;
        const info = await Purchases.getCustomerInfo();
        if (active && isBillingUserReady(userId)) {
          setResult({userId, isPlus: Boolean(info.entitlements.active[ENTITLEMENT_ID]), loading: false});
        }
      } catch {
        if (active) setResult({userId, isPlus: false, loading: false});
      }
    };
    sync();
    const listener = () => {
      // Re-read after identity transitions; an SDK event may describe the previous user.
      if (!active || !userId || !isBillingUserReady(userId)) return;
      Purchases.getCustomerInfo().then(info => {
        if (active && isBillingUserReady(userId)) {
          setResult({userId, isPlus: Boolean(info.entitlements.active[ENTITLEMENT_ID]), loading: false});
        }
      }).catch(() => {
        if (active) setResult({userId, isPlus: false, loading: false});
      });
    };
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      active = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [gated, userId]);

  return {
    isPlus: !gated || Boolean(userId && result.userId === userId && result.isPlus),
    loading: gated && Boolean(userId) && (result.userId !== userId || result.loading),
    refresh,
  };
}
