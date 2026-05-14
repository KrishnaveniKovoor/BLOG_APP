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

      console.debug("Login request to", `${API_URL}/auth/login`);

      let res = await axios.post(`${API_URL}/auth/login`, userCred, {
        withCredentials: true,
      });

      if (res.status === 200) {
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          authChecked: true,
          error: null,
        });
      }
    } catch (err) {
      console.error("Login error:", err);
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

      console.debug("Auth check request to", `${API_URL}/auth/check-auth`);
      const res = await axios.get(`${API_URL}/auth/check-auth`, {
        withCredentials: true,
      });

      if (res.data.isAuthenticated) {
        set({
          currentUser: res.data.payload,
          isAuthenticated: true,
          authChecked: true,
          loading: false,
        });
      } else {
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
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // other errors (e.g., network issues)
      console.error("Auth check failed:", err);
      set({
        currentUser: null,
        isAuthenticated: false,
        authChecked: true,
        loading: false,
      });
    }
  },
}));