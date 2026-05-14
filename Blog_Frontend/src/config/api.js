const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  console.error("[API] VITE_API_URL is not set. Requests will fail unless this variable is configured in Vercel.");
}

export const API_URL = apiUrl;
