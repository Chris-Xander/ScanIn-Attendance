import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, getDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { submitAttendance } from '../utility/attendanceManager';
import './SessionCheckin.css';

function SessionCheckin() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkinForm, setCheckinForm] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [checkingIn, setCheckingIn] = useState(false);
    const [message, setMessage] = useState('');
    const [participant, setParticipant] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [checkingRegistration, setCheckingRegistration] = useState(false);
    const [deviceRecognized, setDeviceRecognized] = useState(false);
    const [recognizedEmail, setRecognizedEmail] = useState('');

    useEffect(() => {
        fetchSession();
        recognizeDevice();
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
            if (sessionDoc.exists()) {
                const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
                setSession(sessionData);
            } else {
                setMessage('Session not found');
            }
        } catch (error) {
            console.error('Error fetching session:', error);
            setMessage('Error loading session');
        } finally {
            setLoading(false);
        }
    };

    const checkParticipantRegistration = async (email) => {
        if (!email || !session) return;

        setCheckingRegistration(true);
        try {
            const participantsQuery = query(
                collection(db, 'participants'),
                where('sessionId', '==', sessionId),
                where('email', '==', email.toLowerCase())
            );
            const participantSnapshot = await getDocs(participantsQuery);

            if (!participantSnapshot.empty) {
                const participantData = participantSnapshot.docs[0].data();
                setParticipant(participantData);
                setIsRegistered(true);
                setCheckinForm({
                    name: participantData.name || '',
                    email: participantData.email || '',
                    phone: participantData.phone || ''
                });
                setMessage('Welcome! You are pre-registered for this session. Your details have been auto-filled.');
            } else {
                setIsRegistered(false);
                setParticipant(null);
                setMessage('You are not pre-registered for this session. Please contact the organizer.');
            }
        } catch (error) {
            console.error('Error checking participant registration:', error);
            setMessage('Error checking registration status. Please try again.');
        } finally {
            setCheckingRegistration(false);
        }
    };

    const handleCheckin = async (e) => {
        e.preventDefault();
        if (!checkinForm.name || !checkinForm.email) {
            setMessage('Please fill in all required fields');
            return;
        }

        setCheckingIn(true);
        setMessage('');

        try {
            // Check if session has expired
            const now = new Date();
            const sessionEndDate = session.endDate ? new Date(session.endDate) : null;

            if (sessionEndDate && now > sessionEndDate) {
                setMessage('This session has expired. Check-in is no longer available.');
                return;
            }

            // Get device ID
            const deviceId = getCookie('scanin_device_id') || generateDeviceId();
            const userEmail = checkinForm.email.toLowerCase();
            const fingerprint = generateFingerprint();

            // Check if any device with the same fingerprint has already checked in for this session
            const devicesQuery = query(
                collection(db, 'devices'),
                where('fingerprint', '==', fingerprint)
            );
            const devicesSnapshot = await getDocs(devicesQuery);

            for (const deviceDoc of devicesSnapshot.docs) {
                const deviceIdToCheck = deviceDoc.id;
                const bindingQuery = query(
                    collection(db, 'sessionDeviceBindings'),
                    where('sessionId', '==', sessionId),
                    where('deviceId', '==', deviceIdToCheck)
                );
                const bindingSnapshot = await getDocs(bindingQuery);
                if (!bindingSnapshot.empty) {
                    setMessage(`This device has already been used to check in for this session. Please use a different device or contact the organizer.`);
                    setCheckingIn(false);
                    return;
                }
            }

            // Check device binding for this session (additional check with current device ID)
            const bindingQuery = query(
                collection(db, 'sessionDeviceBindings'),
                where('sessionId', '==', sessionId),
                where('deviceId', '==', deviceId)
            );
            const bindingSnapshot = await getDocs(bindingQuery);

            if (!bindingSnapshot.empty) {
                // Device is already bound in this session to some user - prevent multiple check-ins per device
                setMessage(`This device has already been used to check in for this session. Please use a different device or contact the organizer.`);
                setCheckingIn(false);
                return;
            } else {
                // No binding exists - create one
                const bindingId = `${sessionId}_${deviceId}`;
                await setDoc(doc(db, 'sessionDeviceBindings', bindingId), {
                    sessionId,
                    deviceId,
                    userEmail,
                    userName: checkinForm.name,
                    boundAt: new Date(),
                    adminId: session.adminId
                });
            }

            // Check if user has checked in within the last 24 hours
            const attendanceQuery = query(
                collection(db, 'attendanceRecords'),
                where('sessionId', '==', sessionId),
                where('email', '==', userEmail)
            );

            const existingCheckins = await getDocs(attendanceQuery);

            if (!existingCheckins.empty) {
                // Get the most recent check-in
                const lastCheckin = existingCheckins.docs
                    .sort((a, b) => b.data().checkInTime.toDate() - a.data().checkInTime.toDate())[0];

                const lastCheckinTime = lastCheckin.data().checkInTime.toDate();
                const now = new Date();
                const hoursSinceLastCheckin = (now - lastCheckinTime) / (1000 * 60 * 60);

                if (hoursSinceLastCheckin < 24) {
                    const remainingHours = Math.ceil(24 - hoursSinceLastCheckin);
                    setMessage(`Looks like you've already been checked in. To checkin again wait ${remainingHours} hours`);
                    setCheckingIn(false);
                    return;
                }
            }

            // Create attendance record (centralized: enforces geofence when configured)
            const uniqueCode = generateUniqueCode();
            await submitAttendance({
                memberId: participant?.memberId || null,
                sessionId,
                deviceToken: deviceId,
                captureLocation: true,
                memberName: checkinForm.name,
                email: userEmail,
                phone: checkinForm.phone || '',
                extra: {
                    participantId: participant?.id || null,
                    participantName: checkinForm.name,
                    uniqueCode,
                    adminId: session.adminId,
                    sessionName: session.name,
                    status: 'present'
                }
            });

            // Save device recognition for future visits
            await saveDeviceRecognition(userEmail);

            setMessage('Check-in successful! Welcome to the session.');
            setCheckinForm({ name: '', email: '', phone: '' });
        } catch (error) {
            console.error('Error during check-in:', error);
            setMessage(error.message || 'Check-in failed. Please try again.');
        } finally {
            setCheckingIn(false);
        }
    };

    const generateUniqueCode = () => {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    // Device Recognition Functions
    const generateDeviceId = () => {
        return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const setCookie = (name, value, days = 365) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    };

    const generateFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Fingerprint', 2, 2);

        const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            canvas: canvas.toDataURL().substring(0, 50) // First 50 chars for fingerprinting
        };

        return btoa(JSON.stringify(fingerprint)).substring(0, 32);
    };

    const recognizeDevice = async () => {
        // 1. Primary: Check cookie
        let deviceId = getCookie('scanin_device_id');
        let email = getCookie('scanin_user_email');

        if (deviceId && email) {
            // Verify device still exists in database
            try {
                const deviceDoc = await getDoc(doc(db, 'devices', deviceId));
                if (deviceDoc.exists()) {
                    setDeviceRecognized(true);
                    setRecognizedEmail(email);
                    setCheckinForm({...checkinForm, email: email});
                    return;
                }
            } catch (error) {
                console.error('Error verifying device:', error);
            }
        }

        // 2. Strong Enhancement: Check localStorage backup
        if (!deviceId) {
            deviceId = localStorage.getItem('scanin_device_id');
            email = localStorage.getItem('scanin_user_email');

            if (deviceId && email) {
                // Restore cookie from localStorage
                setCookie('scanin_device_id', deviceId);
                setCookie('scanin_user_email', email);
                setDeviceRecognized(true);
                setRecognizedEmail(email);
                setCheckinForm({...checkinForm, email: email});
                return;
            }
        }

        // 3. Advanced: Fingerprinting (last resort)
        if (!deviceId) {
            const fingerprint = generateFingerprint();
            try {
                // Query devices with similar fingerprint
                const devicesQuery = query(
                    collection(db, 'devices'),
                    where('fingerprint', '==', fingerprint)
                );
                const devicesSnapshot = await getDocs(devicesQuery);

                if (!devicesSnapshot.empty) {
                    // Found similar device, offer soft recovery
                    const deviceData = devicesSnapshot.docs[0].data();
                    // For now, we'll just log this - in production you'd show a recovery prompt
                    console.log('Similar device found, could offer recovery for:', deviceData.email);
                }
            } catch (error) {
                console.error('Error checking fingerprint:', error);
            }
        }
    };

    const saveDeviceRecognition = async (email) => {
        const deviceId = getCookie('scanin_device_id') || generateDeviceId();
        const fingerprint = generateFingerprint();

        try {
            // Save device info to database
            await setDoc(doc(db, 'devices', deviceId), {
                email: email.toLowerCase(),
                fingerprint: fingerprint,
                lastSeen: new Date(),
                userAgent: navigator.userAgent,
                createdAt: new Date()
            });

            // Set cookies
            setCookie('scanin_device_id', deviceId);
            setCookie('scanin_user_email', email);

            // Set localStorage backup
            localStorage.setItem('scanin_device_id', deviceId);
            localStorage.setItem('scanin_user_email', email);

            setDeviceRecognized(true);
            setRecognizedEmail(email);
        } catch (error) {
            console.error('Error saving device recognition:', error);
        }
    };

    if (loading) {
        return (
            <div className="session-checkin-container">
                <div className="loading">Loading session...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="session-checkin-container">
                <div className="error-message">{message}</div>
                <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="session-checkin-container">
            <div className="session-checkin-card">
                <h1>{session.name}</h1>
                {session.description && <p className="session-description">{session.description}</p>}

                <div className="session-details">
                    <div className="detail-item">
                        <strong>Location:</strong> {session.location || 'Not specified'}
                    </div>
                    <div className="detail-item">
                        <strong>Start:</strong> {session.startDate ? new Date(session.startDate).toLocaleString() : 'Not set'}
                    </div>
                    <div className="detail-item">
                        <strong>End:</strong> {session.endDate ? new Date(session.endDate).toLocaleString() : 'Not set'}
                    </div>
                    <div className="detail-item">
                        <strong>Status:</strong> {session.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>

                {!session.isActive && (
                    <div className="inactive-session">
                        This session is currently inactive. Check-in is not available.
                    </div>
                )}

                {session.isActive && (
                    <div className="checkin-section">
                        {!isRegistered && !participant && (
                            <div className="registration-check">
                                <h2>Check Registration</h2>
                                {deviceRecognized && recognizedEmail && (
                                    <div className="device-recognition-notice">
                                        <div className="registration-status success">
                                            🔄 Welcome back! We recognized your device.
                                        </div>
                                        <p>Your email has been auto-filled. Click "Check Registration" to continue.</p>
                                    </div>
                                )}
                                {!deviceRecognized && (
                                    <p>Please enter your email to check if you're pre-registered for this session.</p>
                                )}

                                <div className="form-group">
                                    <label htmlFor="checkEmail">Email Address *</label>
                                    <input
                                        type="email"
                                        id="checkEmail"
                                        value={checkinForm.email}
                                        onChange={(e) => setCheckinForm({...checkinForm, email: e.target.value})}
                                        placeholder="Enter your email to check registration"
                                        disabled={checkingRegistration}
                                    />
                                </div>

                                <button
                                    onClick={() => checkParticipantRegistration(checkinForm.email)}
                                    disabled={!checkinForm.email || checkingRegistration}
                                    className="checkin-btn"
                                >
                                    {checkingRegistration ? 'Checking...' : 'Check Registration'}
                                </button>

                                {deviceRecognized && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDeviceRecognized(false);
                                            setRecognizedEmail('');
                                            setCheckinForm({ name: '', email: '', phone: '' });
                                        }}
                                        className="back-btn"
                                        style={{ marginTop: '10px', backgroundColor: '#666' }}
                                    >
                                        Use Different Email
                                    </button>
                                )}
                            </div>
                        )}

                        {isRegistered && participant && (
                            <form onSubmit={handleCheckin} className="checkin-form">
                                <h2>Check In</h2>
                                <div className="registration-status success">
                                    ✓ You are pre-registered for this session
                                </div>

                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={checkinForm.name}
                                        onChange={(e) => setCheckinForm({...checkinForm, name: e.target.value})}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={checkinForm.email}
                                        onChange={(e) => setCheckinForm({...checkinForm, email: e.target.value})}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone (Optional)</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={checkinForm.phone}
                                        onChange={(e) => setCheckinForm({...checkinForm, phone: e.target.value})}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={checkingIn}
                                    className="checkin-btn"
                                >
                                    {checkingIn ? 'Checking In...' : 'Check In'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRegistered(false);
                                        setParticipant(null);
                                        setCheckinForm({ name: '', email: '', phone: '' });
                                        setMessage('');
                                    }}
                                    className="back-btn"
                                    style={{ marginTop: '10px', backgroundColor: '#666' }}
                                >
                                    Check Different Email
                                </button>
                            </form>
                        )}

                        {!isRegistered && participant === null && message && message.includes('not pre-registered') && (
                            <div className="registration-status error">
                                {message}
                            </div>
                        )}
                    </div>
                )}

                {message && (
                    <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
            </div>
        </div>
    );
}

export default SessionCheckin;
