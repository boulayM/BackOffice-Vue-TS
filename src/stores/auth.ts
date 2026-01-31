import { defineStore } from "pinia";
import api from "../api/axios";
import { initCsrf, clearCsrf } from "../api/csrf";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    userLoaded: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === "ADMIN",
  },
  actions: {
    async initAuth() {
      this.userLoaded = false;
      try {
        await initCsrf();
        const res = await api.get("/users/me");
        this.user = res.data?.user || null;
      } catch {
        this.user = null;
      } finally {
        this.userLoaded = true;
      }
    },
    async login(email, password) {
      this.userLoaded = false;
      try {
        await api.post("/auth/login", { email, password });
        const res = await api.get("/users/me");
        const user = res.data?.user || null;

        if (!user || user.role !== "ADMIN") {
          this.user = null;
          this.userLoaded = true;
          await this.logout();
          return { user: null, code: "ROLE_NOT_ALLOWED" };
        }

        this.user = user;
        this.userLoaded = true;
        await initCsrf();
        return { user };
      } catch (err) {
        this.user = null;
        this.userLoaded = true;
        const payload = err?.response?.data;
        let message = "Identifiants invalides";
        if (typeof payload === "string") {
          message = payload;
        } else if (payload?.message) {
          message = payload.message;
        } else if (
          Array.isArray(payload?.errors) &&
          payload.errors.length > 0
        ) {
          message = payload.errors[0]?.msg || message;
        }
        const headers = err?.response?.headers || {};
        const limitHeader =
          headers["ratelimit-limit"] || headers["RateLimit-Limit"];
        const remainingHeader =
          headers["ratelimit-remaining"] || headers["RateLimit-Remaining"];
        const limitTotal =
          limitHeader !== undefined ? Number(limitHeader) : payload?.limitTotal;
        const remaining =
          remainingHeader !== undefined
            ? Number(remainingHeader)
            : payload?.remaining;
        return {
          user: null,
          error: message,
          limitTotal,
          remaining,
          status: err?.response?.status,
        };
      }
    },
    async logout() {
      try {
        await api.post("/auth/logout", {});
      } catch {}
      clearCsrf();
      this.user = null;
      this.userLoaded = true;
    },
  },
});
