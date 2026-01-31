import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockApi = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock("../../../api/axios", () => ({ default: mockApi }));
vi.mock("../../../api/csrf", () => ({
  initCsrf: vi.fn(),
  clearCsrf: vi.fn(),
}));

import { useAuthStore } from "../../../stores/auth";

describe("auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockApi.post.mockReset();
    mockApi.get.mockReset();
  });

  it("login success returns admin user", async () => {
    mockApi.post.mockResolvedValue({});
    mockApi.get.mockResolvedValue({ data: { user: { id: 1, role: "ADMIN" } } });

    const store = useAuthStore();
    const res = await store.login("admin@example.com", "Admin123!");

    expect(res.user.role).toBe("ADMIN");
    expect(store.user.role).toBe("ADMIN");
  });

  it("login non admin returns ROLE_NOT_ALLOWED", async () => {
    mockApi.post.mockResolvedValue({});
    mockApi.get.mockResolvedValue({ data: { user: { id: 2, role: "USER" } } });

    const store = useAuthStore();
    const res = await store.login("user@example.com", "User123!");

    expect(res.code).toBe("ROLE_NOT_ALLOWED");
    expect(store.user).toBe(null);
  });
});
