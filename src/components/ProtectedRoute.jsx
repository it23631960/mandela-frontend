import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    // If not logged in, redirect to auth page
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && auth.role !== 'admin') {
    // If admin route and user is not admin, redirect to employee POS
    return <Navigate to="/employeePOS" replace />;
  }

  if (!requireAdmin && auth.role !== 'employee' && auth.role !== 'admin') {
    // If employee route and user is not an employee or admin, redirect to auth
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
