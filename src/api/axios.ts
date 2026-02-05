import axios from "axios";
import router from "../router";
import { getCsrfToken } from "./csrf";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (method !== "get") {
    const token = getCsrfToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";
    const isAuditLogs = url.includes("/audit-logs");
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const onAuthPages =
      currentPath.startsWith("/login") ||
      currentPath.startsWith("/logout") ||
      currentPath.startsWith("/access-denied");

    if (onAuthPages || isAuditLogs) {
      return Promise.reject(err);
    }

    if (status === 401) {
      const url = err.config?.url || "";
      const isMe = url.includes("/users/me");
      if (!isMe) {
        router.push({ path: "/access-denied", query: { reason: "auth" } });
      }
    } else if (status === 403) {
      router.push({ path: "/access-denied", query: { reason: "role" } });
    } else if (status === 429) {
      router.push({ path: "/access-denied", query: { reason: "rate" } });
    } else if (status >= 500) {
      router.push("/server-error");
    }
    return Promise.reject(err);
  },
);

export default api;
