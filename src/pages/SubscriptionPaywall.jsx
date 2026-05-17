import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';
import './SubscriptionPaywall.css';
import { initPayment } from '../services/paymentService';

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
    price: 'Ghc44.99',
    period: '/month',
    days: 30,
    popular: true,
    features: ['30 days access', 'All premium features', 'Priority support'],
    badge: '⭐ Most Popular',
  },
  {
    id: 'annual',
    label: 'Annual',
    price: 'Ghc449.99',
    period: '/year',
    days: 365,
    features: ['365 days access', 'Best value', 'Exclusive perks'],
    badge: '⭐⭐ Save up to 60%',
  },
];

export default function SubscriptionPaywall() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { trialUsed, loading, error, startFreeTrial, activateSubscription } = useSubscription();
  const [activating, setActivating] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFreeTrial = async () => {
    setActivating('trial');
    try {
      await startFreeTrial();
      navigate('/admin');
    } catch (err) {
      setErrors((prev) => ({ ...prev, trial: err.message || 'Trial activation failed' }));
    } finally {
      setActivating(null);
    }
  };

  const handlePlan = async (plan) => {
    if (!currentUser) {
      setErrors({ general: 'Please log in to subscribe' });
      navigate('/login');
      return;
    }
    
    try {
      setActivating(plan);
      const userEmail = currentUser.email;
      const { authorization_url } = await initPayment(userEmail, plan);
      window.location.href = authorization_url;  // Redirect to Paystack
    } catch (err) {
      setErrors({ ...errors, [plan]: err.message });
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
