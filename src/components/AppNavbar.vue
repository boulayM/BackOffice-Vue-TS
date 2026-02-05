<template>
  <nav class="navbar-ui">
    <div class="ds-container nav-inner">
      <div class="nav-left">
        <RouterLink class="navbar-brand" to="/dashboard">Dashboard</RouterLink>

        <RouterLink class="nav-link" to="/users">Users</RouterLink>
        <RouterLink class="nav-link" to="/products">Products</RouterLink>
        <RouterLink class="nav-link" to="/orders">Orders</RouterLink>
        <RouterLink v-if="enableAuditLogs" class="nav-link" to="/audit-logs">Audit Logs</RouterLink>
      </div>
      <div class="nav-right">
        <span v-if="isLoggedIn" class="nav-email">{{ auth.user?.email }}</span>
        <button v-if="isLoggedIn" class="btn-ui" @click="handleLogout">
          Logout
        </button>
        <RouterLink v-else class="btn-ui btn-primary" to="/login"
          >Login</RouterLink
        >
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const isLoggedIn = computed(() => !!auth.user);
const enableAuditLogs = import.meta.env.VITE_ENABLE_AUDIT_LOGS === "true";

const handleLogout = async () => {
  await auth.logout();
  router.push("/login");
};
</script>

<style scoped>
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nav-email {
  font-size: 0.9rem;
  color: #e5e7eb;
}
</style>
