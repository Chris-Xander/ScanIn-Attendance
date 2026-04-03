import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export function SubscriptionGuard({ children }) {
  const { isActive, loading } = useSubscription();

  if (loading) {
    return (
      <div style={{ display: 'flex', align: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading Package...</p>
      </div>
    );
  }

  if (!isActive) {
    return <Navigate to="/paywall" replace />;
  }

  return children;
}
