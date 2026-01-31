<template>
  <div>
    <AppNavbar v-if="!$route.meta.hideNavbar" />
    <main class="app-main container-ui">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppNavbar from "./AppNavbar.vue";
</script>
