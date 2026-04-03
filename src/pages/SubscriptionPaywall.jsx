import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import './SubscriptionPaywall.css';

const PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: 'Ghc20.99',
    period: '/week',
    days: 7,
    features: ['7 days access', 'Full features', 'Cancel anytime'],
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$39.99',
    period: '/month',
    days: 30,
    popular: true,
    features: ['30 days access', 'All premium features', 'Priority support'],
    badge: 'Most Popular',
  },
  {
    id: 'annual',
    label: 'Annual',
    price: '$399.99',
    period: '/year',
    days: 365,
    features: ['365 days access', 'Best value', 'Exclusive perks'],
    badge: 'Save 44%',
  },
];

export default function SubscriptionPaywall() {
  const navigate = useNavigate();
  const { trialUsed, loading, error, startFreeTrial, activateSubscription } = useSubscription();
  const [activating, setActivating] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFreeTrial = async () => {
    try {
      setActivating('trial');
      setErrors({});
      await startFreeTrial();
      navigate('/admin');
    } catch (err) {
      setErrors({ trial: err.message || 'Failed to activate free trial' });
    } finally {
      setActivating(null);
    }
  };

  const handlePlan = async (planId) => {
    try {
      setActivating(planId);
      setErrors({});
      await activateSubscription(planId);
      navigate('/admin');
    } catch (err) {
      setErrors({ [planId]: err.message || `Failed to activate ${planId} plan` });
    } finally {
      setActivating(null);
    }
  };

  if (loading) {
    return (
      <div className="paywall-container">
        <div className="paywall-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paywall-container">
      {/* Header */}
      <header className="paywall-header">
        <div className="paywall-header-content">
          <div className="paywall-logo">
            <div className="logo-icon">👑</div>
            <span>KansoCheckin Premium</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="paywall-close-btn"
            title="Back to home"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="paywall-main">
        {/* Hero */}
        <section className="paywall-hero">
          <h1 className="paywall-title">Unlock Premium Access</h1>
          <p className="paywall-subtitle">
            Gain full access to all premium features and elevate your experience
          </p>
        </section>

        {/* Plans Grid */}
        <section className="paywall-plans-section">
          {/* Free Trial Card */}
          {!trialUsed && (
            <div className="plan-card trial-card">
              <div className="plan-header">
                <span className="plan-emoji">🎉</span>
                <h3>Free Trial</h3>
              </div>
              <p className="plan-desc">21 days full access• No card required. Click to start now!</p>
              <button
                onClick={handleFreeTrial}
                disabled={!!activating}
                className="plan-btn trial-btn"
              >
                {activating === 'trial' ? (
                  <>
                    <span className="spinner"></span>
                    Activating...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </button>
              {errors.trial && <div className="plan-error">{errors.trial}</div>}
            </div>
          )}

          {/* Paid Plans */}
          <div className="plans-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                {plan.popular && <div className="popular-indicator">⭐ Most Popular</div>}

                <div className="plan-header">
                  <h3>{plan.label}</h3>
                </div>

                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>

                <p className="plan-desc">{plan.days} days of access</p>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="checkmark">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlan(plan.id)}
                  disabled={!!activating}
                  className={`plan-btn ${plan.popular ? 'primary' : 'secondary'}`}
                >
                  {activating === plan.id ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    `Get ${plan.label}`
                  )}
                </button>

                {errors[plan.id] && (
                  <div className="plan-error">{errors[plan.id]}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Global Error */}
        {error && !Object.keys(errors).length && (
          <div className="paywall-error-banner">
            <strong>Error:</strong> {error.message || 'Something went wrong'}
          </div>
        )}

        {/* Footer Info */}
        <section className="paywall-footer-info">
          <div className="info-row">
            <span className="info-check">✓</span>
            <span>Cancel anytime - no hidden fees</span>
          </div>
          <div className="info-row">
            <span className="info-check">✓</span>
            <span>Secure payment processing</span>
          </div>
          <div className="info-row">
            <span className="info-check">✓</span>
            <span>24/7 customer support</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="paywall-footer">
        <p>Need help? <a href="/">Contact support: kansocheckin@gmail.com</a></p>
        <p className="paywall-legal">By subscribing, you agree to our Terms of Service</p>
      </footer>
    </div>
  );
}
