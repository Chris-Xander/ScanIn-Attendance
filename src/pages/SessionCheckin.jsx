import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, doc, getDoc, addDoc, query, where, getDocs } from 'firebase/firestore';
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

    useEffect(() => {
        fetchSession();
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

    const handleCheckin = async (e) => {
        e.preventDefault();
        if (!checkinForm.name || !checkinForm.email) {
            setMessage('Please fill in all required fields');
            return;
        }

        setCheckingIn(true);
        setMessage('');

        try {
            // Check if user has already checked in
            const attendanceQuery = query(
                collection(db, 'attendanceLogs'),
                where('sessionId', '==', sessionId),
                where('email', '==', checkinForm.email.toLowerCase())
            );
            const existingCheckin = await getDocs(attendanceQuery);

            if (!existingCheckin.empty) {
                setMessage('You have already checked in to this session');
                return;
            }

            // Create attendance log
            await addDoc(collection(db, 'attendanceLogs'), {
                sessionId,
                sessionName: session.name,
                participantName: checkinForm.name,
                email: checkinForm.email.toLowerCase(),
                phone: checkinForm.phone || '',
                checkInTime: new Date(),
                uniqueCode: generateUniqueCode(),
                adminId: session.adminId
            });

            setMessage('Check-in successful! Welcome to the session.');
            setCheckinForm({ name: '', email: '', phone: '' });
        } catch (error) {
            console.error('Error during check-in:', error);
            setMessage('Check-in failed. Please try again.');
        } finally {
            setCheckingIn(false);
        }
    };

    const generateUniqueCode = () => {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
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
                    <form onSubmit={handleCheckin} className="checkin-form">
                        <h2>Check In</h2>

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
                    </form>
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
