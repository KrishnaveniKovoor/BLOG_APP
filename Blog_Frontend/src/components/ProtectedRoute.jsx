import { useAuth } from "../store/authStore";
import { Navigate } from "react-router";
import {toast} from "react-hot-toast";

function ProtectedRoute({ children, allowedRoles }) {
  // get auth state from store - use individual selectors
  const loading = useAuth((state) => state.loading);
  const currentUser = useAuth((state) => state.currentUser);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const authChecked = useAuth((state) => state.authChecked);

  console.log("[ProtectedRoute] Auth state:", { loading, isAuthenticated, currentUser, authChecked, allowedRoles });

  // wait until auth state is resolved
  if (loading || !authChecked) {
    console.log("[ProtectedRoute] Still loading/checking auth...");
    return <p>Loading...</p>;
  }

  // if user not logged in
  if (!isAuthenticated) {
    console.log("[ProtectedRoute] User not authenticated, redirecting to login");
    toast.error("Redirecting to Login");
    return <Navigate to="/login" replace />;
  }

  //check roles
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    console.log("[ProtectedRoute] User role not allowed, redirecting to unauthorized");
    //redirect to Login
    return <Navigate to="/unauthorized" replace state={{ redirectTo: "/" }} />;
  }

  console.log("[ProtectedRoute] User authorized, rendering children");
  return children;
}

export default ProtectedRoute;