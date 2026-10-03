import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  ClubLoginRequest,
  ClubLoginResponse,
} from "@/network-calls/types";

/**
 * POST /auth/club-login
 *
 * Club-account sign-in (email + password). Unlike the student flows there is
 * no Academia proxying — the backend returns a JWT directly, which authenticates
 * subsequent club endpoints. Token persistence is wired at integration time.
 *
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
 */
export async function postClubLogin(
  credentials: ClubLoginRequest,
  config?: RequestConfig,
): Promise<ClubLoginResponse> {
  const { data } = await apiClient.post<ClubLoginResponse>(
    "/auth/club-login",
    credentials,
    config,
  );
  return data;
}

/**
 * Narrowing guard — the backend signals the outcome in the body
 * (`status: "success"`) rather than through the HTTP status code.
 */
export function isClubLoginSuccess(response: ClubLoginResponse): boolean {
  return response.status === "success";
}

/** Client-side login mutation. */
export function useClubLogin() {
  return useMutation({
    mutationFn: (credentials: ClubLoginRequest) => postClubLogin(credentials),
  });
}
