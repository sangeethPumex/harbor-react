import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/slices/authSlice";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: `${apiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token into header of every request
api.interceptors.request.use(
  (config) => {
    // Read token from Redux store first, fallback to localStorage
    let token = store.getState().auth.token;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("harbor_token");
    }

    if (token) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Globally handle responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the error is due to an invalid/expired token or unauthorized access
    if (error.response && error.response.status === 401) {
      // Clear token and authentication state
      store.dispatch(logout());
      
      // If we are on the client, redirect to login page
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
