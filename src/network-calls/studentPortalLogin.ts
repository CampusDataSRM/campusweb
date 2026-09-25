import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  StudentPortalLoginRequest,
  StudentPortalLoginResponse,
} from "@/network-calls/types";

/**
 * POST /student-portal/login
 *
 * Direct student-portal sign-in (net id + registration number, not the
 * Academia-proxied /auth/login); returns the active semester id.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function postStudentPortalLogin(
  credentials: StudentPortalLoginRequest,
  config?: RequestConfig,
): Promise<StudentPortalLoginResponse> {
  const { data } = await apiClient.post<StudentPortalLoginResponse>(
    "/student-portal/login",
    credentials,
    config,
  );
  return data;
}

/**
 * Narrowing guard — the backend signals the outcome in the body
 * (`status: "success"`) rather than through the HTTP status code.
 */
export function isStudentPortalLoginSuccess(
  response: StudentPortalLoginResponse,
): boolean {
  return response.status === "success";
}

/** Client-side login mutation. Session persistence is wired at integration time. */
export function useStudentPortalLogin() {
  return useMutation({
    mutationFn: (credentials: StudentPortalLoginRequest) =>
      postStudentPortalLogin(credentials),
  });
}
