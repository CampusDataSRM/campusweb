import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  AttendanceRequest,
  AttendanceResponse,
} from "@/network-calls/types";

/**
 * POST /student-portal/attendance
 *
 * Per-subject attendance for the signed-in student (net id only — relies on
 * the student-portal session established by /student-portal/login).
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function postAttendance(
  body: AttendanceRequest,
  config?: RequestConfig,
): Promise<AttendanceResponse> {
  const { data } = await apiClient.post<AttendanceResponse>(
    "/student-portal/attendance",
    body,
    config,
  );
  return data;
}

/**
 * Narrowing guard — the backend signals the outcome in the body
 * (`status: "success"`) rather than through the HTTP status code.
 */
export function isAttendanceSuccess(response: AttendanceResponse): boolean {
  return response.status === "success";
}

/** Client-side attendance mutation. */
export function useAttendance() {
  return useMutation({
    mutationFn: (body: AttendanceRequest) => postAttendance(body),
  });
}
