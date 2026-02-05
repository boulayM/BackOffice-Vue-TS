import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth";

const enableAuditLogs = import.meta.env.VITE_ENABLE_AUDIT_LOGS === "true";

import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Products from "../views/Products.vue";
import Orders from "../views/Orders.vue";
import AuditLogs from "../views/AuditLogs.vue";
import Logout from "../views/Logout.vue";
import ErrorPage from "../views/ErrorPage.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    component: Login,
    meta: { requiresAuth: false, hideNavbar: true },
  },
  {
    path: "/logout",
    component: Logout,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/users",
    component: Users,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/products",
    component: Products,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  {
    path: "/orders",
    component: Orders,
    meta: { requiresAuth: true, roles: ["ADMIN"] },
  },
  ...(enableAuditLogs
    ? [
        {
          path: "/audit-logs",
          component: AuditLogs,
          meta: { requiresAuth: true, roles: ["ADMIN"] },
        },
      ]
    : []),

  { path: "/access-denied", component: ErrorPage },
  { path: "/server-error", component: ErrorPage, meta: { reason: "server" } },
  {
    path: "/:pathMatch(.*)*",
    component: ErrorPage,
    meta: { reason: "not-found" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta?.requiresAuth) {
    if (!auth.userLoaded) {
      await auth.initAuth();
    }
    if (!auth.isLoggedIn) {
      return { path: "/access-denied", query: { reason: "auth" } };
    }
    const roles = to.meta?.roles;
    if (
      Array.isArray(roles) &&
      roles.length > 0 &&
      !roles.includes(auth.user?.role)
    ) {
      return { path: "/access-denied", query: { reason: "role" } };
    }
  }
});

export default router;
