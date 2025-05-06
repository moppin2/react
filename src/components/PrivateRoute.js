import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    // 로그인 안 됐으면 /login으로, 원래 있던 경로를 state.from 에 실어서
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  //instructor, user 권한관리
  if (allowedRoles && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}