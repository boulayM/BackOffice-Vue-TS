<template>
  <div class="toast-host">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="`toast-${t.type}`"
    >
      {{ t.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { toasts } from "../services/toast/toast";
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 16px;
  top: 16px;
  z-index: 9999;
  display: grid;
  gap: 8px;
}
.toast {
  min-width: 240px;
  max-width: 420px;
  background: #111;
  color: #fff;
  padding: 10px 14px;
  border: 1px solid #000;
  box-shadow: 2px 2px 0 #000;
  font-size: 14px;
}
.toast-success { background: #0b6b2f; }
.toast-error { background: #8a1c1c; }
.toast-info { background: #2a4b8d; }
</style>