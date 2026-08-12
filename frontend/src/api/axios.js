import axios from "axios";

// In development, Vite's proxy forwards "/api" to localhost:5000 (see vite.config.js).
// In production, frontend and backend are deployed on different domains, so we need
// the full backend URL — set VITE_API_URL in your hosting provider's environment variables,
// e.g. VITE_API_URL=https://your-backend.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach admin token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
