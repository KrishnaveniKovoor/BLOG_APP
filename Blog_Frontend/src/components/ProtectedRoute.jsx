import { useAuth } from "../store/authStore";
import { Navigate } from "react-router";
import {toast} from "react-hot-toast";

function ProtectedRoute({ children, allowedRoles }) {
  // get auth state from store
  const { loading, currentUser, isAuthenticated, authChecked } = useAuth();

  // wait until auth state is resolved
  if (loading || !authChecked) {
    return <p>Loading...</p>;
  }

  // if user not logged in
  if (!isAuthenticated) {
    toast.error("Redirecting to Login");
    return <Navigate to="/login" replace />;
  }

  //check roles
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
   
    //redirect to Login
    return <Navigate to="/unauthorized" replace state={{ redirectTo: "/" }} />;
  }

  return children;
}

export default ProtectedRoute;