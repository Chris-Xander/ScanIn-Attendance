import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { db } from '../firebase/config';
import { 
  collection, query, where, onSnapshot, doc, getDoc 
} from 'firebase/firestore';
import './AdminUserProfile.css';

const AdminUserProfile = () => {
  const { currentUser, getUserData } = useAuth();
  const { isActive, plan, expiresAt, daysRemaining } = useSubscription();
  
  const [userData, setUserData] = useState(null);
  const [adminStats, setAdminStats] = useState({
    totalSessions: 0,
    totalMembers: 0,
    totalCheckins: 0
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.uid) return;
      try {
        const data = await getUserData();
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, [currentUser, getUserData]);

  // Load admin stats (live)
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Sessions created by this admin
    const sessionsQ = query(
      collection(db, 'sessions'),
      where('adminId', '==', currentUser.uid)
    );
    const unsubscribeSessions = onSnapshot(sessionsQ, (snap) => {
      setAdminStats(prev => ({ ...prev, totalSessions: snap.docs.length }));
    });

    const unsubscribeMembers = onSnapshot(membersQ, (snap) => {
      setAdminStats(prev => ({ ...prev, totalMembers: snap.docs.length }));
    });

    // Total check-ins for this admin's sessions
    const checkinsQ = query(
      collection(db, 'attendanceRecords'),
      where('adminId', '==', currentUser.uid)
    );
    const unsubscribeCheckins = onSnapshot(checkinsQ, (snap) => {
      setAdminStats(prev => ({ ...prev, totalCheckins: snap.docs.length }));
    });

    return () => {
      unsubscribeSessions();
      unsubscribeMembers();
      unsubscribeCheckins();
    };
  }, [currentUser?.uid]);

  const getInitials = (name) => {
    if (!name) return 'A';
    const names = name.trim().split(/\s+/);
    return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="admin-user-profile">
      <div className="profile-header">
        <div className="avatar">
          {getInitials(currentUser?.displayName || userData?.displayName)}
        </div>
        <div className="profile-info">
          <h1>{currentUser?.displayName || userData?.displayName || 'Admin'}</h1>
          <p>{currentUser?.email}</p>
          <div className="phone">{userData?.phone || 'Phone not set'}</div>
        </div>
      </div>

      <div className="profile-stats-grid">
        {/* Subscription */}
        <div className="stat-card subscription">
          <h3>Subscription</h3>
          <div className={`status ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
          <div className="stat-row">

            <span>Plan:</span>
            <span className="plan">{plan?.toUpperCase()}</span>
          </div>
          {expiresAt && (
            <div className="stat-row">
              <span>Expires:</span>
              <span>{formatDate(expiresAt)}</span>
            </div>
          )}
          {daysRemaining !== null && (
            <div className="stat-row">
              <span>Days left:</span>
              <span>{daysRemaining}</span>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="stat-card account">
          <h3>Account</h3>
          <div className="stat-row">
            <span>Role:</span>
            <span className="role">Admin</span>
          </div>
          <div className="stat-row">
            <span>Member since:</span>
            <span>{formatDate(userData?.createdAt)}</span>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="stat-card activity">
          <h3>Activity</h3>
          <div className="stats">
            <div className="stat-item">
              <div className="number">{adminStats.totalSessions}</div>
              <div>Sessions</div>
            </div>

            <div className="stat-item">
              <div className="number">{adminStats.totalCheckins}</div>
              <div>Check-ins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserProfile;

