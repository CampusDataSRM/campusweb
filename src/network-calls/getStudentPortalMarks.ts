import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  StudentPortalMarksRequest,
  StudentPortalMarksResponse,
} from "@/network-calls/types";

/**
 * POST /student-portal/marks
 *
 * Test performances from the Student Portal - the source for first-years and
 * the fallback when Academia publishes none. Needs the HttpOnly Student
 * Portal cookie: pass `studentPortalRequestConfig(session)`.
 */
export async function postStudentPortalMarks(
  body: StudentPortalMarksRequest,
  config?: RequestConfig,
): Promise<StudentPortalMarksResponse> {
  const { data } = await apiClient.post<StudentPortalMarksResponse>(
    "/student-portal/marks",
    body,
    config,
  );
  return data;
}
