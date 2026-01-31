<template>
  <section class="ds-container">
    <h1>Deconnexion</h1>
    <p>Redirection...</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  await auth.logout();
  router.push("/login");
});
</script>
