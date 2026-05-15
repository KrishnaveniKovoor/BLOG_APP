import { create } from "zustand";
import axios from "axios";
import { API_URL } from "../config/api";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  authChecked: false,
  error: null,
  login: async (userCred) => {
    try {
      set({
        loading: true,
        currentUser: null,
        isAuthenticated: false,
        error: null,
      });

      if (!API_URL) {
        throw new Error("Missing API URL. Set VITE_API_URL in your frontend environment.");
      }

      console.log("[Auth] Login attempt to", `${API_URL}/auth/login`);

      let res = await axios.post(`${API_URL}/auth/login`, userCred, {
        withCredentials: true,
      });

      console.log("[Auth] Login response status:", res.status);
      console.log("[Auth] Login response payload:", res.data?.payload);

      if (res.status === 200) {
        console.log("[Auth] Setting authenticated state");
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          authChecked: true,
          error: null,
        });
      }
    } catch (err) {
      console.error("[Auth] Login error:", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || err.message || "Login failed",
      });
    }
  },
  logout: async () => {
    try {
      //set loading state
      //make logout api req
      let res = await axios.get(`${API_URL}/auth/logout`, {
        withCredentials: true,
      });
      //update state
      if (res.status === 200) {
        set({
          currentUser: null,
          isAuthenticated: false,
          authChecked: true,
          error: null,
          loading: false,
        });
      }
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || "Logout failed",
      });
    }
  },
  // restore login
  checkAuth: async () => {
    try {
      set({ loading: true });
      if (!API_URL) {
        throw new Error("Missing API URL for auth check. Set VITE_API_URL in your frontend environment.");
      }

      console.log("[Auth] Checking authentication...");
      const res = await axios.get(`${API_URL}/auth/check-auth`, {
        withCredentials: true,
      });

      console.log("[Auth] Check-auth response:", res.data);

      if (res.data.isAuthenticated) {
        console.log("[Auth] User is authenticated:", res.data.payload);
        set({
          currentUser: res.data.payload,
          isAuthenticated: true,
          authChecked: true,
          loading: false,
        });
      } else {
        console.log("[Auth] User is not authenticated");
        set({
          currentUser: null,
          isAuthenticated: false,
          authChecked: true,
          loading: false,
        });
      }
    } catch (err) {
      // If user is not logged in → do nothing
      if (err.response?.status === 401) {
        console.log("[Auth] Received 401 on check-auth");
        set({
          currentUser: null,
          isAuthenticated: false,
          authChecked: true,
          loading: false,
        });
        return;
      }

      // other errors (e.g., network issues)
      console.error("[Auth] Check-auth failed:", err);
      set({
        currentUser: null,
        isAuthenticated: false,
        authChecked: true,
        loading: false,
      });
    }
  },
}));