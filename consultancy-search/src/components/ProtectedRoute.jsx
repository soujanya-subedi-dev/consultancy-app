// Create ProtectedRoute.jsx component
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  
  if (!token) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  
  return children;
}