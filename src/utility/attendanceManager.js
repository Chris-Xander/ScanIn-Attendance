/**
 * Attendance Manager - Handles attendance record creation and submission
 * Used for device-token-based multi-day session attendance tracking
 */

import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getDeviceLocation, isWithinGeofence } from './deviceTokenManager';

/**
 * Submit attendance record for a member
 * @param {Object} params - Attendance parameters
 * @param {string} params.memberId - Member ID
 * @param {string} params.sessionId - Session ID
 * @param {string} params.deviceToken - Device token
 * @param {boolean} params.captureLocation - Whether to capture location
 * @returns {Promise<Object>} Created attendance record
 */
export const submitAttendance = async ({
  memberId = null,
  sessionId,
  deviceToken = null,
  captureLocation = false,
  memberName: memberDisplayName = null,
  email = null,
  phone = null,
  extra = {}
}) => {
  try {
    // Get session details for geofence validation
    const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const sessionData = sessionDoc.data();
    let location = null;
    
    // Capture location if requested
    if (captureLocation) {
      location = await getDeviceLocation();
      
      // Validate geofence if configured
      if (sessionData.geofence && sessionData.geofence.latitude && sessionData.geofence.longitude) {
        if (!isWithinGeofence(location, sessionData.geofence)) {
          throw new Error('You are outside the geofence for this session! Please move to the required location to check in.');
        }
      }
    }
    
    // Get member details for display (support optional anonymous check-ins)
    let memberName = 'Unknown';
    if (memberId) {
      try {
        const memberDoc = await getDoc(doc(db, 'members', memberId));
        if (memberDoc.exists()) {
          memberName = memberDoc.data().name;
        }
      } catch (err) {
        console.warn('Error fetching member doc:', err);
      }
    } else if (memberDisplayName) {
      memberName = memberDisplayName;
    }
    
    // Create attendance record
    const attendanceRef = collection(db, 'attendanceRecords');
    const attendanceData = {
      memberId: memberId || null,
      sessionId,
      deviceToken: deviceToken || null,
      memberName,
      participantName: extra.participantName || memberName,
      sessionName: sessionData.name,
      timestamp: serverTimestamp(),
      checkInTime: new Date(),
      status: extra.status || 'present',
      ...(location && {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          capturedAt: location.timestamp
        }
      }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...extra
    };
    
    const docRef = await addDoc(attendanceRef, attendanceData);
    
    return {
      id: docRef.id,
      ...attendanceData
    };
  } catch (error) {
    console.error('Error submitting attendance:', error);
    throw error;
  }
};

/**
 * Check if member already checked in for a session today
 * @param {string} memberId - Member ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} True if already checked in
 */
export const hasCheckedInToday = async (memberId, sessionId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceRef = collection(db, 'attendanceRecords');
    const q = query(
      attendanceRef,
      where('memberId', '==', memberId),
      where('sessionId', '==', sessionId)
    );
    
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const checkInDate = new Date(doc.data().checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      if (checkInDate.getTime() === today.getTime()) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking in status:', error);
    return false;
  }
};

/**
 * Get attendance summary for a member in a session
 * @param {string} memberId - Member ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Attendance summary
 */
export const getMemberSessionAttendance = async (memberId, sessionId) => {
  try {
    const attendanceRef = collection(db, 'attendanceRecords');
    const q = query(
      attendanceRef,
      where('memberId', '==', memberId),
      where('sessionId', '==', sessionId)
    );
    
    const snapshot = await getDocs(q);
    
    return {
      totalCheckIns: snapshot.size,
      checkIns: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  } catch (error) {
    console.error('Error getting member session attendance:', error);
    throw error;
  }
};

/**
 * Get session attendance summary
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session attendance summary
 */
export const getSessionAttendanceSummary = async (sessionId) => {
  try {
    const attendanceRef = collection(db, 'attendanceRecords');
    const q = query(attendanceRef, where('sessionId', '==', sessionId));
    
    const snapshot = await getDocs(q);
    
    const summary = {
      totalCheckIns: snapshot.size,
      uniqueMembers: new Set(),
      checkInsByDate: {},
      memberCheckIns: {}
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      summary.uniqueMembers.add(data.memberId);
      
      const date = new Date(data.checkInTime).toLocaleDateString();
      summary.checkInsByDate[date] = (summary.checkInsByDate[date] || 0) + 1;
      
      if (!summary.memberCheckIns[data.memberId]) {
        summary.memberCheckIns[data.memberId] = {
          name: data.memberName,
          checkIns: []
        };
      }
      summary.memberCheckIns[data.memberId].checkIns.push({
        id: doc.id,
        ...data
      });
    });
    
    summary.uniqueMembers = summary.uniqueMembers.size;
    
    return summary;
  } catch (error) {
    console.error('Error getting session attendance summary:', error);
    throw error;
  }
};

export default {
  submitAttendance,
  hasCheckedInToday,
  getMemberSessionAttendance,
  getSessionAttendanceSummary
};
