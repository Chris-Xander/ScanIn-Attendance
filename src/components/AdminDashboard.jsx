import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './AdminDashboard.css';

function AdminDashboard() {
    const { currentUser } = useAuth();
    const [activeQRCount, setActiveQRCount] = useState(0);
    const [todayScansCount, setTodayScansCount] = useState(0);
    const [totalReportsCount, setTotalReportsCount] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        // Listener for Active QR Codes (isActive === true)
        const qrUnsubscribe = onSnapshot(
            query(
                collection(db, 'customQRCodes'),
                where('adminId', '==', currentUser.uid),
                where('isActive', '==', true)
            ),
            (snapshot) => setActiveQRCount(snapshot.size),
            (error) => console.error('Error fetching active QR codes:', error)
        );

        // Listener for Today's Scans (any form submissions today)
        const getTodayTimestampRange = () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return { start: today, end: tomorrow };
        };

        const { start: todayStart, end: todayEnd } = getTodayTimestampRange();
        const todayUnsubscribe = onSnapshot(
            query(
                collection(db, 'formSubmitData'),
                where('adminId', '==', currentUser.uid)
            ),
            (snapshot) => {
                // Filter for submissions today
                const todayCount = snapshot.docs.filter(doc => {
                    const ts = doc.data().timestamp;
                    const submitDate = typeof ts === 'string' ? new Date(ts) : ts?.toDate?.() || new Date(ts);
                    return submitDate >= todayStart && submitDate < todayEnd;
                }).length;
                setTodayScansCount(todayCount);
            },
            (error) => console.error('Error fetching today scans:', error)
        );

        // Listener for Total Reports
        const reportsUnsubscribe = onSnapshot(
            query(
                collection(db, 'qrGateReports'),
                where('adminId', '==', currentUser.uid)
            ),
            (snapshot) => setTotalReportsCount(snapshot.size),
            (error) => console.error('Error fetching total reports:', error)
        );

        // Cleanup listeners on unmount or currentUser change
        return () => {
            qrUnsubscribe();
            todayUnsubscribe();
            reportsUnsubscribe();
        };
    }, [currentUser]);

    return (
        <div className='dashboard-display-container'>
            <h2>Admin Dashboard</h2>
            <p>Welcome to the admin panel. </p>

            {/* Dashboard Stats */}
            <div className="dashboard-content">
                <div className="dashboard-stat">
                    <h3>Active QR Codes</h3>
                    <p>{activeQRCount}</p>
                </div>
                <div className="dashboard-stat">
                    <h3>Today's Scans</h3>
                    <p>{todayScansCount}</p>
                </div>
                <div className="dashboard-stat">
                    <h3>Total Reports</h3>
                    <p>{totalReportsCount}</p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
