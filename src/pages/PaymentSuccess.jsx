import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../services/paymentService';
import { useSubscription } from '../hooks/useSubscription';
import './SubscriptionPaywall.css';  // Reuse styles from same folder

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const reference = searchParams.get('reference');
    const { refresh, isActive } = useSubscription();
    const [status, setStatus] = useState('Verifying payment...');
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval;
        const check = async () => {
            try {
                const data = await verifyPayment(reference);
                setStatus(data.status);
                if (data.status === 'success') {
                    await refresh(); // Update subscription status
                    // Check subscription after refresh
                    setTimeout(() => {
                      if (isActive) {
                        navigate('/login');
                      } else {
                        navigate('/login');
                      }
                    }, 1500);
                }
            } catch (err) {
                setError(err.message);
                setStatus('failed');
            }
        };
        check();
        interval = setInterval(check, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [reference, refresh, navigate]);

             return (
    <div className="paywall-container">
      <div className="paywall-loading">
        {status === 'loading' && <div>Processing payment... Please wait</div>}
        {status === 'success' && <div>✅ Payment successful! Redirecting...</div>}
        {status === 'failed' && <div>❌ Payment failed: {error}</div>}
        <button onClick={() => navigate('/paywall')} className="plan-btn">Back to Plans</button>
      </div>
    </div>
  );
}     

