import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import { authMessages } from "../../../messages/authMessages";

const push = vi.fn();

vi.mock("vue-router", async () => {
  const actual = await import("vue-router");
  return {
    ...actual,
    useRouter: () => ({ push }),
  };
});

let mockAuth;
vi.mock("../../../stores/auth", () => ({
  useAuthStore: () => mockAuth,
}));

const loadLogin = async () =>
  (await import("../../../views/Login.vue")).default;

describe("Login", () => {
  beforeEach(() => {
    push.mockReset();
    mockAuth = {
      login: vi.fn(),
      user: null,
      loading: false,
      error: "",
    };
  });

  it("navigates to dashboard for admin", async () => {
    mockAuth.login.mockResolvedValue({ user: { role: "ADMIN" } });

    const Login = await loadLogin();
    const wrapper = shallowMount(Login);

    await wrapper.find("#email").setValue("admin@example.com");
    await wrapper.find("#password").setValue("Admin123!");
    await wrapper.find("form").trigger("submit.prevent");

    await Promise.resolve();
    await nextTick();

    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("shows admin-only error for non-admin", async () => {
    mockAuth.login.mockResolvedValue({ user: null, code: "ROLE_NOT_ALLOWED" });

    const Login = await loadLogin();
    const wrapper = shallowMount(Login);

    await wrapper.find("#email").setValue("user@example.com");
    await wrapper.find("#password").setValue("User123!");
    await wrapper.find("form").trigger("submit.prevent");

    await Promise.resolve();
    await nextTick();

    expect(wrapper.text()).toContain(authMessages.adminOnly);
  });
});
