<template>
  <div class="ds-container error-page">
    <div class="error-card">
      <h2>Erreur</h2>
      <p class="error-message">{{ message }}</p>
      <RouterLink class="btn-ui btn-primary" to="/">Retour</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { authMessages } from "../messages/authMessages";

const route = useRoute();

const reason = computed(
  () => route.query.reason || route.meta?.reason || "generic",
);

const message = computed(() => {
  switch (reason.value) {
    case "auth":
      return authMessages.accessDeniedAuth;
    case "role":
    case "admin":
      return authMessages.accessDeniedRole;
    case "rate":
      return authMessages.loginLimitReached;
    case "server":
      return authMessages.serverError;
    case "not-found":
      return authMessages.notFound;
    default:
      return authMessages.genericError;
  }
});
</script>

<style scoped>
.error-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.error-card {
  max-width: 520px;
  width: 100%;
  border: 1px solid #000;
  padding: 24px;
  text-align: center;
  background: #fff;
}
.error-message {
  margin: 12px 0 20px;
}
</style>
