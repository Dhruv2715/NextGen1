import axios from "axios";
import { BASE_URL } from "../constants/apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        // Don't force-redirect on auth endpoints; let the UI show the error message.
        // Otherwise login/register failures cause a confusing reload back to "/".
        const url = error.config?.url || "";
        const isAuthCall =
          url.includes("/api/auth/login") ||
          url.includes("/api/auth/register") ||
          url.includes("/api/auth/google") ||
          url.includes("/api/auth/profile");

        if (!isAuthCall) {
          // Redirect to login page for protected resources
          window.location.href = "/";
        }
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
