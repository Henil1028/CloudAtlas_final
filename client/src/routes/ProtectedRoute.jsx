import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-dark text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
          <p className="text-gray-400 font-medium">Authorizing secure access...</p>
        </div>
      </div>
    );
  }

  // Check if authenticated
  if (!token || !user) {
    if (allowedRoles && allowedRoles.includes('super_admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (allowedRoles.includes('super_admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
