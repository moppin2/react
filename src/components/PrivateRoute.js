import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children, allowedRoles, allowedStatus }) {
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

  if (allowedStatus && user.status && !allowedStatus.includes(user.status)) {
    // 상태 조건 불충족 시 → 강사 인증 페이지로 리디렉션
    return <Navigate to="/instructor/verify" replace />;
  }

  return children;
}