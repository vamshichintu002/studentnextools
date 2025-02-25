import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, setIsLoginModalOpen, setPendingPath } = useAuth();

  if (!user) {
    // Store the attempted path and show login modal
    setPendingPath(window.location.pathname);
    setIsLoginModalOpen(true);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
