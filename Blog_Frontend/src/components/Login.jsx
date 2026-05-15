import { useForm } from "react-hook-form";
import {
  pageBackground,
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  mutedText,
  linkClass,
  loadingClass,
} from "../styles/common";
import { NavLink, useNavigate, useLocation } from "react-router";
import { useAuth } from "../store/authStore";
import { useEffect } from "react";
import {toast} from 'react-hot-toast'

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  //get state from auth store - use individual selectors to prevent unnecessary re-renders
  const login = useAuth((state) => state.login);
  const currentUser = useAuth((state) => state.currentUser);
  const loading = useAuth((state) => state.loading);
  const error = useAuth((state) => state.error);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  //on user login
  const onUserLogin = (userCredObj) => {
    //call login() of auth store
    login(userCredObj);
  };

  useEffect(() => {
    //navigation logic
    console.log("[Login] Auth state changed:", { isAuthenticated, currentUser, loading });
    
    if (isAuthenticated === true && currentUser) {
      console.log("[Login] User authenticated, redirecting...");
      
      if (currentUser.role === "USER") {
        console.log("[Login] Redirecting USER to /user-profile");
        toast.success("Login success and redirecting to User Profile",{duration:2000})
        navigate("/user-profile");
      }
      else if (currentUser.role === "AUTHOR") {
        console.log("[Login] Redirecting AUTHOR to /author-profile");
        toast.success("Login success and redirecting to Author Profile",{duration:2000})
        navigate("/author-profile");
      }
      else if (currentUser.role === "ADMIN") {
        console.log("[Login] Redirecting ADMIN to /admin-profile");
        toast.success("Login success and redirecting to Admin Profile",{duration:2000})
        navigate("/admin-profile");
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  //deal with loading
  if (loading) {
    return <p className={loadingClass}>Loading....</p>;
  }

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className={formCard}>
        {/* Title */}
        <h2 className={formTitle}>Sign In</h2>

        {/* API error */}
        {error && <p className={errorClass}>{error}</p>}

        <form onSubmit={handleSubmit(onUserLogin)}>
          {/* Email */}
          <div className={formGroup}>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
              {...register("email", {
                required: "Email is required",
                validate: (value) => value.trim().length > 0 || "Email cannot be empty",
              })}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className={formGroup}>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={inputClass}
              {...register("password", {
                required: "Password is required",
                validate: (value) => value.trim().length > 0 || "Password cannot be empty",
              })}
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {/* Forgot password */}
          <div className="text-right -mt-2 mb-4">
            <a href="/forgot-password" className={`${linkClass} text-xs`}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button type="submit" className={submitBtn}>
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className={`${mutedText} text-center mt-5`}>
          Don't have an account?{" "}
          <NavLink to="/register" className={linkClass}>
            Create one
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Login;