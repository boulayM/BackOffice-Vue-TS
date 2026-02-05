import { ref } from "vue";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

export const toasts = ref<ToastItem[]>([]);

let nextId = 1;

const push = (type: ToastType, message: string, timeout = 3000) => {
  const id = nextId++;
  toasts.value.push({ id, type, message });
  if (timeout > 0) {
    setTimeout(() => {
      const idx = toasts.value.findIndex((t) => t.id === id);
      if (idx !== -1) toasts.value.splice(idx, 1);
    }, timeout);
  }
};

export const toast = {
  success: (message: string, timeout?: number) => push("success", message, timeout),
  error: (message: string, timeout?: number) => push("error", message, timeout),
  info: (message: string, timeout?: number) => push("info", message, timeout),
};