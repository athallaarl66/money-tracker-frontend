// money-tracker-fe/src/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: ambil token dari auth-storage (tempat Zustand persist nyimpen)
function getToken(): string | null {
  try {
    const raw = localStorage.getItem("auth-storage");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// Request interceptor — otomatis attach JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — kalau 401, berarti token expired → paksa logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
