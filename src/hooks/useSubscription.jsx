import { useCallback, useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const checkSubscriptionStatusFn = httpsCallable(functions, 'checkSubscriptionStatus');
const activateFreeTrialFn = httpsCallable(functions, 'activateFreeTrial');
/* DISABLED activateSubscriptionFn - use payment webhook only */

let cachedSubscription = null;

// Add to exports
export const verifyPaymentHook = async (ref) => {
  // Use paymentService.verifyPayment(ref)
  await refresh();  // After verify
};

export function useSubscription() {
  const [state, setState] = useState({
    isActive: false,
    plan: 'free',
    expiresAt: null,
    trialUsed: false,
    daysRemaining: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      cachedSubscription = null; // Clear cache on refresh
      const res = await checkSubscriptionStatusFn({});
      const data = res.data;

      if (data.subscriptionEnd) {
        data.expiresAt = new Date(data.subscriptionEnd);
      }

      setState({
        isActive: !!data.active,
        plan: data.plan || 'free',
        expiresAt: data.expiresAt || null,
        trialUsed: !!data.trialUsed,
        daysRemaining: data.daysRemaining || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('useSubscription refresh error:', err);
      setState((prev) => ({ ...prev, loading: false, error: err }));
    }
  }, []);

  const startFreeTrial = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await activateFreeTrialFn({});
      const data = res.data;

      if (data.subscriptionEnd) {
        data.expiresAt = new Date(data.subscriptionEnd);
      }

      setState({
        isActive: !!data.active,
        plan: data.plan || 'trial',
        expiresAt: data.expiresAt || null,
        trialUsed: !!data.trialUsed,
        daysRemaining: data.daysRemaining || null,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      console.error('startFreeTrial error:', err);
      setState((prev) => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, []);

  /* DISABLED: activateSubscription - use initPayment + webhook only
  const activateSubscription = useCallback(async (plan) => {
    throw new Error('Direct subscription activation disabled. Complete payment via Paystack.');
  }, []); */

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Stub for backward compatibility
  const activateSubscription = useCallback(async () => {
    throw new Error('Subscription activation disabled. Use Paystack checkout.');
  }, []);
  
  return {
    ...state,
    refresh,
    startFreeTrial,
    activateSubscription, // Safe stub
  };
}
