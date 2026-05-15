import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import UserProfile from "./components/UserProfile";
import AuthorProfile from "./components/AuthorProfile";
import AdminProfile from "./components/AdminProfile";
import AuthorArticles from "./components/AuthorArticles";
import EditArticle from "./components/EditArticle";
import WriteArticles from "./components/WriteArticles";
import ArticleByID from "./components/ArticleById";
import { Toaster } from "react-hot-toast";
import Unauthorized from "./components/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";
import { API_URL } from "./config/api";
import { useAuth } from "./store/authStore";
import { useEffect } from "react";

function App() {
  const logout = useAuth((state) => state.logout);
  const checkAuth = useAuth((state) => state.checkAuth);

  // Configure axios once on mount
  useEffect(() => {
    if (!API_URL) {
      console.error("VITE_API_URL is not defined. Please set VITE_API_URL in Vercel environment variables.");
      return;
    }

    console.log("[App] Setting up axios with API_URL:", API_URL);

    axios.defaults.baseURL = API_URL;
    axios.defaults.withCredentials = true;

    const interceptor = axios.interceptors.response.use(
      (response) => {
        console.log("[Interceptor] Success response from", response.config.url);
        return response;
      },
      (error) => {
        console.log("[Interceptor] Error response from", error.config?.url, "Status:", error.response?.status);
        if (error.response?.status === 401) {
          console.log("[Interceptor] Got 401, logging out...");
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // Check authentication on app load
  useEffect(() => {
    if (!API_URL) return;
    console.log("[App] App mounted, checking auth...");
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "register",
          element: <Register />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "user-profile",
          element: (
            <ProtectedRoute allowedRoles={["USER"]}>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "author-profile",
          element: (
            <ProtectedRoute allowedRoles={["AUTHOR"]}>
              <AuthorProfile />
            </ProtectedRoute>
          ),

          children: [
            {
              index: true,
              element: <AuthorArticles />,
            },
            {
              path: "articles",
              element: <AuthorArticles />,
            },
            {
              path: "write-article",
              element: <WriteArticles />,
            },
          ],
        },
        {
          path: "admin-profile",
          element: (
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminProfile />
            </ProtectedRoute>
          ),
        },
        {
          path: "article/:id",
          element: <ArticleByID />,
        },
        {
          path: "edit-article",
          element: <EditArticle />,
        },
        {
          path: "unauthorized",
          element: <Unauthorized />,
        },
      ],
    },
  ]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={routerObj} />
    </div>
  );
}

export default App;