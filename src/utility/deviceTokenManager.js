/**
 * Device Token Manager - Handles device token generation, storage, and retrieval
 * Used for device-token-based multi-day session attendance tracking
 */

import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const DEVICE_TOKEN_KEY = 'scanin_device_token';
const MEMBER_ID_KEY = 'scanin_member_id';

/**
 * Generate a unique device token
 * @returns {string} Unique device token
 */
export const generateDeviceToken = () => {
  return `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Save device token to localStorage
 * @param {string} deviceToken - The device token to save
 */
export const saveDeviceTokenLocally = (deviceToken) => {
  localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
};

/**
 * Retrieve device token from localStorage
 * @returns {string|null} The stored device token or null
 */
export const getStoredDeviceToken = () => {
  return localStorage.getItem(DEVICE_TOKEN_KEY);
};

/**
 * Save member ID to localStorage
 * @param {string} memberId - The member ID to save
 */
export const saveMemberIdLocally = (memberId) => {
  localStorage.setItem(MEMBER_ID_KEY, memberId);
};

/**
 * Retrieve member ID from localStorage
 * @returns {string|null} The stored member ID or null
 */
export const getStoredMemberId = () => {
  return localStorage.getItem(MEMBER_ID_KEY);
};

/**
 * Clear both device token and member ID from localStorage
 */
export const clearDeviceData = () => {
  localStorage.removeItem(DEVICE_TOKEN_KEY);
  localStorage.removeItem(MEMBER_ID_KEY);
};

/**
 * Link device token to member in Firestore
 * @param {string} deviceToken - Device token
 * @param {string} memberId - Member ID
 * @returns {Promise<string>} Document ID of the devices collection entry
 */
export const linkDeviceToMember = async (deviceToken, memberId) => {
  try {
    const devicesRef = collection(db, 'devices');
    
    // Check if device already exists
    const q = query(devicesRef, where('deviceToken', '==', deviceToken));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing device token
      const existingDoc = snapshot.docs[0];
      await updateDoc(doc(db, 'devices', existingDoc.id), {
        memberId,
        linkedAt: serverTimestamp(),
        isActive: true
      });
      return existingDoc.id;
    } else {
      // Create new device entry
      const docRef = await addDoc(devicesRef, {
        deviceToken,
        memberId,
        createdAt: serverTimestamp(),
        linkedAt: serverTimestamp(),
        isActive: true
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error linking device to member:', error);
    throw error;
  }
};

/**
 * Get member ID from device token
 * @param {string} deviceToken - Device token
 * @returns {Promise<string|null>} Member ID or null if not found
 */
export const getMemberIdFromDevice = async (deviceToken) => {
  try {
    const devicesRef = collection(db, 'devices');
    const q = query(devicesRef, where('deviceToken', '==', deviceToken), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data().memberId;
    }
    return null;
  } catch (error) {
    console.error('Error getting member ID from device:', error);
    throw error;
  }
};

/**
 * Register or re-register a device for a member
 * Called on first scan or when device token is lost
 * @param {string} uniqueIdentifier - Member's unique identifier (email/phone)
 * @returns {Promise<Object>} { memberId, deviceToken, isNewDevice }
 */
export const registerOrReregisterDevice = async (uniqueIdentifier) => {
  try {
    // Find member by unique identifier
    const membersRef = collection(db, 'members');
    const q = query(membersRef, where('uniqueIdentifier', '==', uniqueIdentifier.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Member not found. Please contact your administrator.');
    }
    
    const memberId = snapshot.docs[0].id;
    const memberData = snapshot.docs[0].data();
    
    // Check if device token exists
    const storedToken = getStoredDeviceToken();
    let deviceToken = storedToken;
    let isNewDevice = false;
    
    if (!storedToken) {
      // Generate new device token
      deviceToken = generateDeviceToken();
      isNewDevice = true;
    }
    
    // Link device to member in Firestore
    await linkDeviceToMember(deviceToken, memberId);
    
    // Save locally
    saveDeviceTokenLocally(deviceToken);
    saveMemberIdLocally(memberId);
    
    return {
      memberId,
      deviceToken,
      isNewDevice,
      memberName: memberData.name
    };
  } catch (error) {
    console.error('Error registering/re-registering device:', error);
    throw error;
  }
};

/**
 * Initialize device on app load
 * Checks for existing device token and member ID
 * @returns {Promise<Object|null>} { memberId, deviceToken } or null
 */
export const initializeDevice = async () => {
  try {
    const deviceToken = getStoredDeviceToken();
    const memberId = getStoredMemberId();
    
    if (deviceToken && memberId) {
      // Verify device is still linked in Firestore
      const linkedMemberId = await getMemberIdFromDevice(deviceToken);
      if (linkedMemberId === memberId) {
        return { memberId, deviceToken };
      } else {
        // Device token is not valid anymore, clear local data
        clearDeviceData();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error initializing device:', error);
    return null;
  }
};

/**
 * Get device location for geofencing validation
 * @returns {Promise<Object|null>} { latitude, longitude, accuracy } or null
 */
export const getDeviceLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date()
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Validate if location is within geofence
 * @param {Object} location - { latitude, longitude, accuracy }
 * @param {Object} geofence - { latitude, longitude, radius }
 * @returns {boolean} True if within geofence
 */
export const isWithinGeofence = (location, geofence) => {
  if (!location || !geofence || !geofence.latitude || !geofence.longitude || !geofence.radius) {
    return true; // No geofence validation if data missing
  }
  
  const R = 6371; // Earth's radius in km
  const dLat = (geofence.latitude - location.latitude) * (Math.PI / 180);
  const dLng = (geofence.longitude - location.longitude) * (Math.PI / 180);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(location.latitude * (Math.PI / 180)) * Math.cos(geofence.latitude * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance <= (geofence.radius / 1000); // Convert radius from meters to km
};

export default {
  generateDeviceToken,
  saveDeviceTokenLocally,
  getStoredDeviceToken,
  saveMemberIdLocally,
  getStoredMemberId,
  clearDeviceData,
  linkDeviceToMember,
  getMemberIdFromDevice,
  registerOrReregisterDevice,
  initializeDevice,
  getDeviceLocation,
  isWithinGeofence
};
