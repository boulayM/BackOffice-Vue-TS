import { describe, it, expect, vi } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";

vi.mock("../../../api/csrf", () => ({
  getCsrfToken: vi.fn(),
}));

import api from "../../../api/axios";
import { getCsrfToken } from "../../../api/csrf";

const getRequestInterceptor = () =>
  (
    api.interceptors.request as unknown as {
      handlers: Array<{
        fulfilled: (
          _c: InternalAxiosRequestConfig,
        ) => InternalAxiosRequestConfig;
      }>;
    }
  ).handlers[0].fulfilled;

describe("axios interceptor", () => {
  it("adds csrf header on non-GET", () => {
    vi.mocked(getCsrfToken).mockReturnValue("token-123");
    const config = {
      method: "post",
      headers: {},
    } as InternalAxiosRequestConfig;
    const result = getRequestInterceptor()(config);
    expect(result.headers["X-CSRF-Token"]).toBe("token-123");
  });

  it("does not add header on GET", () => {
    vi.mocked(getCsrfToken).mockReturnValue("token-123");
    const config = { method: "get", headers: {} } as InternalAxiosRequestConfig;
    const result = getRequestInterceptor()(config);
    expect(result.headers["X-CSRF-Token"]).toBeUndefined();
  });
});
