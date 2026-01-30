import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/userContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    } else if (user.role === 'interviewer') {
      return <Navigate to="/interviewer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
