import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { LoginRequest, LoginResponse } from "@/network-calls/types";

/**
 * POST /auth/login
 *
 * Proxies an SRM Academia sign-in: the backend performs the portal login and
 * returns the harvested Academia session cookies in the response's `Cookies`
 * field (see LoginResponse).
 *
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
 */
export async function postLogin(
  credentials: LoginRequest,
  config?: RequestConfig,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
    config,
  );
  return data;
}

/**
 * Narrowing guard — the backend may signal the outcome in the body
 * (`Status: "success"`) rather than through the HTTP status code.
 */
export function isLoginSuccess(response: LoginResponse): boolean {
  return response.Status === "success";
}

/** Client-side login mutation. Session persistence is wired at integration time. */
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => postLogin(credentials),
  });
}
