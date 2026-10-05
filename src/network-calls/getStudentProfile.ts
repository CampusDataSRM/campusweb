import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { StudentProfile } from "@/network-calls/types";

/**
 * GET /auth/user
 *
 * The signed-in student's profile - identity, courses with attendance, test
 * performances - from the backend's cache. Authenticated: `X-CSRF-Token` and
 * `X-Net-ID` (see lib/api/request-config.ts).
 */
export async function fetchStudentProfile(
  config?: RequestConfig,
): Promise<StudentProfile> {
  const { data } = await apiClient.get<StudentProfile>("/auth/user", config);
  return data;
}
