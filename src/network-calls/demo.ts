import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  AllClubsResponse,
  AllEventsResponse,
  DemoLoginRequest,
  DemoLoginResponse,
  DemoSnapshotResponse,
  StudentProfile,
  TimetableResponse,
} from "@/network-calls/types";

/**
 * The evaluator (demo) account's endpoints - a self-contained events
 * programme served by the backend, authenticated with `X-Demo-Token`.
 */

/** POST /demo/login */
export async function postDemoLogin(
  credentials: DemoLoginRequest,
  config?: RequestConfig,
): Promise<DemoLoginResponse> {
  const { data } = await apiClient.post<DemoLoginResponse>(
    "/demo/login",
    credentials,
    config,
  );
  return data;
}

/** GET /demo/snapshot - the demo profile. */
export async function fetchDemoProfile(
  config?: RequestConfig,
): Promise<StudentProfile> {
  const { data } = await apiClient.get<DemoSnapshotResponse>(
    "/demo/snapshot",
    config,
  );
  return data.content;
}

/** GET /demo/timetable */
export async function fetchDemoTimetable(
  config?: RequestConfig,
): Promise<TimetableResponse> {
  const { data } = await apiClient.get<TimetableResponse>(
    "/demo/timetable",
    config,
  );
  return data;
}

/** GET /demo/events */
export async function fetchDemoEvents(
  config?: RequestConfig,
): Promise<AllEventsResponse> {
  const { data } = await apiClient.get<AllEventsResponse>(
    "/demo/events",
    config,
  );
  return data;
}

/** GET /demo/clubs */
export async function fetchDemoClubs(
  config?: RequestConfig,
): Promise<AllClubsResponse> {
  const { data } = await apiClient.get<AllClubsResponse>(
    "/demo/clubs",
    config,
  );
  return data;
}

/** POST /demo/logout - best effort; the token simply expires otherwise. */
export async function postDemoLogout(config?: RequestConfig): Promise<void> {
  await apiClient.post("/demo/logout", undefined, config);
}
