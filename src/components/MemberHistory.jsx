import { useState, useEffect } from 'react';
import '../page_styles/MemberHistory.css';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import mockService from '../services/mockService';
import { useAuth } from '../contexts/AuthContext';

const MemberHistory = ({ currentUser }) => {
    const [scanHistory, setScanHistory] = useState([]);
    const { useMock } = useAuth();

    // Fetch scan history live for the current user
    useEffect(() => {
        if (!currentUser) return;

        if (useMock) {
            // Mock service - get from mock data
            const mockHistory = mockService.data.scanHistory.filter(
                entry => entry.userId === currentUser.uid
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setScanHistory(mockHistory);
        } else {
            // Real Firebase - live updates from Firestore
            const q = query(
                collection(db, 'scanHistory'),
                where('userId', '==', currentUser.uid),
                orderBy('timestamp', 'desc')
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const history = [];
                querySnapshot.forEach((doc) => {
                    history.push({ id: doc.id, ...doc.data() });
                });
                setScanHistory(history);
            });
            return unsubscribe;
        }
    }, [currentUser, useMock]);

    return (
        <div className="member-container-history">
            <h1 className="member-title">Attendance History</h1>
            <p className="member-desc">Your recent clock-in and clock-out records will appear here.</p>
            <ul className="history-list">
                {scanHistory.length === 0 ? (
                    <li className="history-item">No scan history found.</li>
                ) : (
                    scanHistory.map((entry) => (
                        <li className="history-item" key={entry.id}>
                            <span style={{ fontWeight: 600 }}>
                                {useMock
                                    ? new Date(entry.timestamp).toLocaleString()
                                    : (entry.timestamp && entry.timestamp.toDate ? entry.timestamp.toDate().toLocaleString() : 'Unknown time')
                                }
                            </span>
                            <span style={{ marginTop: '0.3rem' }}>{entry.result}</span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default MemberHistory;
