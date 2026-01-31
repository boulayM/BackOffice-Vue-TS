import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/tests/unit/setupTests.ts"],
    include: ["src/tests/unit/**/*.{test,spec}.ts", "src/tests/unit/**/*.{test,spec}.tsx"]
  }
});
