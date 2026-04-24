import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = false; // fake auth
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
