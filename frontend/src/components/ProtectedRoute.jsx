import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Exige token; opcionalmente exige um role específico (dev | recruiter). */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user?.role !== role) {
    const fallback = user?.role === 'recruiter' ? '/recrutador/vagas' : '/vagas';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
