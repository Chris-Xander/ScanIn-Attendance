import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  initializeDevice,
  registerOrReregisterDevice,
  getStoredDeviceToken,
  getStoredMemberId
} from '../utility/deviceTokenManager';
import {
  submitAttendance,
  hasCheckedInToday
} from '../utility/attendanceManager';
import '../page_styles/SessionCheckin.css';

function SessionCheckin() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('identify'); // identify, verify, checkin, success
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const [deviceToken, setDeviceToken] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    loadSession();
    initDevice();
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(console.error);
      }
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }
      
      const sessionsRef = db.collection ? db.collection('sessions') : null;
      
      // Try to find session by sessionId
      const sessionSnap = await getDoc(doc(db, 'sessions', sessionId));
      
      if (sessionSnap.exists()) {
        setSession({ id: sessionSnap.id, ...sessionSnap.data() });
      } else {
        // Try to find by sessionId field
        const query = db.collection ? 
          db.collection('sessions').where('sessionId', '==', sessionId).limit(1) : null;
        // Fallback to direct lookup since we don't have a sessionId field in this session
        setError('Session not found');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session');
      setLoading(false);
    }
  };

  const initDevice = async () => {
    try {
      const device = await initializeDevice();
      if (device) {
        setDeviceToken(device.deviceToken);
        setMemberInfo({ memberId: device.memberId });
        setStep('verify');
      }
    } catch (err) {
      console.error('Error initializing device:', err);
    }
  };

  const handleIdentifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!uniqueIdentifier.trim()) {
        setError('Please enter your email or phone number');
        setLoading(false);
        return;
      }

      const result = await registerOrReregisterDevice(uniqueIdentifier);
      
      setMemberInfo({
        memberId: result.memberId,
        memberName: result.memberName
      });
      setDeviceToken(result.deviceToken);
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to register device');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndCheckin = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if already checked in today
      const alreadyCheckedIn = await hasCheckedInToday(memberInfo.memberId, session.id);
      
      if (alreadyCheckedIn) {
        setCheckinMessage('You have already checked in to this session today!');
        setStep('success');
        setLoading(false);
        return;
      }

      // Submit attendance
      const attendance = await submitAttendance({
        memberId: memberInfo.memberId,
        sessionId: session.id,
        deviceToken,
        captureLocation: !!session.geofence
      });

      setCheckedIn(true);
      setCheckinMessage(`Welcome, ${memberInfo.memberName}! Your attendance has been recorded.`);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to check in');
      console.error('Checkin error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="session-checkin-container">
        <div className="checkin-loader">
          <div className="spinner"></div>
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="session-checkin-container">
        <div className="checkin-error">
          <h2>Session Not Found</h2>
          <p>{error || 'The requested session could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-checkin-container">
      <div className="checkin-card">
        <div className="checkin-header">
          <h1>{session.name}</h1>
          <p>{session.description}</p>
        </div>

        {error && (
          <div className="checkin-error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {step === 'identify' && (
          <div className="checkin-form">
            <h3>Identify Yourself</h3>
            <p>Enter your email or phone number to check in</p>
            <form onSubmit={handleIdentifySubmit}>
              <label htmlFor="identifier">Email / Phone:</label>
              <input
                type="text"
                id="identifier"
                value={uniqueIdentifier}
                onChange={(e) => setUniqueIdentifier(e.target.value)}
                placeholder="john@example.com or +1234567890"
                required
              />
              <button type="submit" disabled={loading} className="checkin-btn">
                {loading ? 'Registering...' : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {step === 'verify' && memberInfo && (
          <div className="checkin-verify">
            <h3>Verify Check-in</h3>
            <div className="member-details">
              <p><strong>Member:</strong> {memberInfo.memberName || 'Registered Member'}</p>
              <p><strong>Session:</strong> {session.name}</p>
              <p><strong>Location:</strong> {session.location || 'Not specified'}</p>
              <p><strong>Date:</strong> {new Date(session.startDate).toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleVerifyAndCheckin}
              disabled={loading}
              className="checkin-btn checkin-btn-primary"
            >
              {loading ? 'Checking in...' : 'Check In'}
            </button>
            <button
              onClick={() => {
                setStep('identify');
                setUniqueIdentifier('');
                setMemberInfo(null);
              }}
              className="checkin-btn checkin-btn-secondary"
            >
              Use Different ID
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="checkin-success">
            <div className="success-icon">✓</div>
            <h3>Check-in Successful!</h3>
            <p>{checkinMessage}</p>
            <div className="session-details">
              <p><strong>Member:</strong> {memberInfo.memberName}</p>
              <p><strong>Session:</strong> {session.name}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
            <button
              onClick={() => {
                setStep('identify');
                setUniqueIdentifier('');
                setMemberInfo(null);
              }}
              className="checkin-btn checkin-btn-primary"
            >
              Check In Another Member
            </button>
          </div>
        )}

        <div className="session-info">
          <h4>Session Information</h4>
          <p><strong>Start:</strong> {new Date(session.startDate).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(session.endDate).toLocaleString()}</p>
          {session.geofence?.latitude && session.geofence?.longitude && (
            <p><strong>Location:</strong> Geofence enabled ({session.geofence.radius}m radius)</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SessionCheckin;
