import { getAuth } from 'firebase/auth';
import { functions } from '../firebase/config';

// Get auth instance for ID token
const auth = getAuth();

export const initPayment = async (email, plan) => {
  if (!email || !plan) {
    throw new Error('Email and plan are required to initialize payment.');
  }

  const idToken = await auth.currentUser.getIdToken();
  const url = `https://us-central1-attendance-app-3efdc.cloudfunctions.net/initPaymentHttp`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ email, plan })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Payment init failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data;
};

export const verifyPayment = async (reference) => {
  const url = `https://us-central1-attendance-app-3efdc.cloudfunctions.net/verifyPayment/${reference}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  if (!res.ok) throw new Error('Failed to verify payment');
  return res.json();
};
