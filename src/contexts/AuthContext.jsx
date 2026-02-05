import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useMock] = useState(() => {
    // Check if we should use mock service
    return import.meta.env.VITE_USE_REAL_FIREBASE !== 'true';
  });

  function signup (email, password, name, role) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        // Update profile with name and role
        await updateProfile(result.user, {
          displayName: name,
          photoURL: role// Using photoURL to store role for simplicity
        });

        await setDoc(doc(db, 'users', result.user.uid), {
          email: email,
          displayName: name,
          role: role,
          createdAt: new Date(),
          phone: '',
          photoURL: ''
        });

        await sendEmailVerification(result.user);

        return result;

      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  // Function to update user profile
  function updateUserProfile(updates) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    return updateProfile(currentUser, updates);
  }

  // Function to update user data in Firestore
  async function updateUserData(updates) {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, updates, { merge: true });
  }

  // Function to get user data from Firestore
  async function getUserData() {
    if (!currentUser) return null;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  // Helper function to get user display name
  function getUserDisplayName() {
    if (!currentUser) return 'Guest';
    return currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  }

  // Helper function to get user role
  async function getUserRole() {
    if (!currentUser) return 'guest';

    // First try to get from Firestore
    try {
      const userData = await getUserData();
      if (userData && userData.role) {
        return userData.role;
      }
    } catch (error) {
      console.warn('Could not get role from Firestore, falling back to auth profile:', error);
    }

    // Fallback to photoURL (for backward compatibility)
    return currentUser.photoURL || 'member';
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    useMock,
    signup,
    login,
    logout,
    updateUserProfile,
    updateUserData,
    getUserData,
    getUserDisplayName,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
