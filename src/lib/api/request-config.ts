/**
 * Per-request auth: turns a session into the axios config its requests need.
 *
 * The API authenticates with explicit headers, not cookies, except the
 * Student Portal, whose session is an HttpOnly cookie on the API origin and
 * so needs `withCredentials`:
 * - academia / student-portal sessions: `X-CSRF-Token` (session token) and
 *   `X-Net-ID` (the Student Portal binds its session to the NetID);
 * - demo sessions: `X-Demo-Token`;
 * - club portal: `Authorization: Bearer <jwt>`;
 * - guests: nothing - public endpoints only.
 */

import type { RequestConfig } from "@/lib/api/axios-client";
import type { StudentSession } from "@/lib/auth/session";

export function studentRequestConfig(
  session: StudentSession | null,
): RequestConfig {
  if (!session || session.kind === "guest") return {};
  if (session.kind === "demo") {
    return { headers: { "X-Demo-Token": session.token } };
  }
  return {
    headers: { "X-CSRF-Token": session.token, "X-Net-ID": session.netId },
    withCredentials: session.kind === "student-portal",
  };
}

/** Student Portal endpoints always carry the API-origin session cookie. */
export function studentPortalRequestConfig(
  session: StudentSession | null,
): RequestConfig {
  const config = studentRequestConfig(session);
  return { ...config, withCredentials: true };
}

export function clubRequestConfig(token: string | null): RequestConfig {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
