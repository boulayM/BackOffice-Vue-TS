import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.e2e" });

const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";
const apiURL = process.env.E2E_API_URL || "http://localhost:3001/api";
const runLogout = String(process.env.E2E_RUN_LOGOUT || "") === "1";

export default defineConfig({
  testDir: "src/tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "setup",
      testMatch: "**/e2e.setup.spec.ts",
      use: { storageState: undefined }
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: "e2e.storage.json" }
    }
  ],
  webServer: {
    command: "npm run dev -- --host",
    url: baseURL,
    reuseExistingServer: true,
    env: { VITE_API_URL: apiURL }
  },
  metadata: { runLogout }
});
