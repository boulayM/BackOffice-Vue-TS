<template>
  <section class="login-page">
    <div class="login-card">
      <h1 class="login-title">Bienvenue sur l'interface administrateur</h1>
      <p class="login-subtitle">Veuillez vous connecter pour continuer.</p>

      <form class="form-ui" @submit.prevent="handleLogin">
        <div class="form-row">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            class="form-control"
            type="email"
            v-model="email"
            required
          />
        </div>
        <div class="form-row">
          <label class="form-label" for="password">Mot de passe</label>
          <input
            id="password"
            class="form-control"
            type="password"
            v-model="password"
            required
          />
        </div>
        <div class="actions">
          <button class="btn-ui btn-primary" type="submit" :disabled="loading">
            {{ loading ? authMessages.loginLoading : authMessages.loginSubmit }}
          </button>
        </div>
        <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { authMessages } from "../messages/authMessages";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await auth.login(email.value, password.value);
    if (!result || !result.user) {
      if (result?.code === "ROLE_NOT_ALLOWED") {
        error.value = authMessages.adminOnly;
      } else if (result?.status === 429) {
        error.value = authMessages.loginLimitReached;
      } else {
        const baseMessage = result?.error || authMessages.loginInvalid;
        if (
          result?.limitTotal !== undefined &&
          result?.remaining !== undefined
        ) {
          const total = result.limitTotal ?? 5;
          const remaining = result.remaining ?? 0;
          if (remaining <= 0) {
            error.value = authMessages.loginLimitReached;
          } else {
            error.value = `${baseMessage}. ${authMessages.loginRemaining(remaining, total)}`;
          }
        } else {
          error.value = baseMessage;
        }
      }
      email.value = "";
      password.value = "";
      return;
    }
    router.push("/dashboard");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #000;
  padding: 24px;
}
.login-title,
.login-subtitle {
  text-align: center;
}
.login-subtitle {
  margin-bottom: 20px;
}
.form-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-row {
  width: 100%;
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.form-control {
  border: 1px solid #000;
  border-radius: 0;
  padding: 8px 10px;
}
.btn {
  border: 1px solid #000;
  border-radius: 0;
  background: transparent;
  color: #000;
  padding: 8px 14px;
}
.actions {
  margin-top: 16px;
  text-align: center;
}
</style>
