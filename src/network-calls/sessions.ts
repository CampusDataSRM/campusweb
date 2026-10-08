import { apiClient } from "@/lib/api/axios-client";
import { studentRequestConfig } from "@/lib/api/request-config";
import type { StudentSession } from "@/lib/auth/session";

export interface DeviceSession {
  sessionId: string;
  provider: string;
  deviceName: string;
  platform: string;
  model?: string;
  appVersion?: string;
  approxLocation?: string;
  client: string;
  ip?: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

/** NEXT_PUBLIC_SERVE includes /api, so these resolve to /api/sessions. */
export async function getSessions(
  session: StudentSession,
  signal?: AbortSignal,
): Promise<DeviceSession[]> {
  const { data } = await apiClient.get<{ sessions: DeviceSession[] }>(
    "/sessions",
    {
      ...studentRequestConfig(session),
      signal,
    },
  );
  return data.sessions;
}

export async function revokeSession(
  session: StudentSession,
  sessionId: string,
): Promise<void> {
  await apiClient.delete(
    `/sessions/${encodeURIComponent(sessionId)}`,
    studentRequestConfig(session),
  );
}

export async function revokeOtherSessions(
  session: StudentSession,
): Promise<void> {
  await apiClient.delete("/sessions", studentRequestConfig(session));
}
