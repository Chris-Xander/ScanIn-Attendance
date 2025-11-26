import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  // Check if user has the required role
  if (requiredRole) {
    const userRole = currentUser.photoURL; // We stored role in photoURL
    if (userRole !== requiredRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
} 