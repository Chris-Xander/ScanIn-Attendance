import { useCallback, useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const checkSubscriptionStatusFn = httpsCallable(functions, 'checkSubscriptionStatus');
const activateFreeTrialFn = httpsCallable(functions, 'activateFreeTrial');
const activateSubscriptionFn = httpsCallable(functions, 'activateSubscription');

let cachedSubscription = null;

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

  const activateSubscription = useCallback(async (plan) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await activateSubscriptionFn({
        plan,
        paymentProof: 'backend-simulated-payment-token',
      });
      const data = res.data;

      if (data.subscriptionEnd) {
        data.expiresAt = new Date(data.subscriptionEnd);
      }

      setState({
        isActive: !!data.active,
        plan: data.plan || plan,
        expiresAt: data.expiresAt || null,
        trialUsed: !!data.trialUsed,
        daysRemaining: data.daysRemaining || null,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      console.error('activateSubscription error:', err);
      setState((prev) => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    startFreeTrial,
    activateSubscription,
  };
}
