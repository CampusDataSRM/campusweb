/**
 * The signed-in session: its shape, and its persistence in the cookie store.
 *
 * One JSON cookie on the frontend origin holds the session material the API
 * layer needs - never a password. Living in a cookie (not web storage) lets
 * proxy.ts route on it before any page renders.
 *
 * Session kinds:
 * - `academia`        token = the Academia session cookie string, sent as
 *                      X-CSRF-Token;
 * - `student-portal`  token = STUDENT_PORTAL_SESSION_MARKER; the real session
 *                      is an HttpOnly cookie on the API origin (first-years);
 * - `demo`            token = the demo JWT, sent as X-Demo-Token;
 * - `guest`           no token - public events, clubs and legal pages only.
 */

import {
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  STUDENT_PORTAL_SESSION_MARKER,
} from "@/constants/auth";
import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";

export type SessionKind = "academia" | "student-portal" | "demo" | "guest";

export interface StudentSession {
  kind: SessionKind;
  /** Session token per kind (see above); empty for guests. */
  token: string;
  /** Username without the domain, lowercased - sent as X-Net-ID. */
  netId: string;
}

const KINDS: readonly SessionKind[] = [
  "academia",
  "student-portal",
  "demo",
  "guest",
];

/** Validate untrusted cookie content into a session, or null. */
export function parseSession(raw: string | null | undefined): StudentSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StudentSession>;
    if (!value || !KINDS.includes(value.kind as SessionKind)) return null;
    const token = typeof value.token === "string" ? value.token : "";
    const netId = typeof value.netId === "string" ? value.netId : "";
    if (value.kind !== "guest" && (!token || !netId)) return null;
    return { kind: value.kind as SessionKind, token, netId };
  } catch {
    return null;
  }
}

export async function readSession(): Promise<StudentSession | null> {
  return parseSession(await getCookie(SESSION_COOKIE));
}

export async function writeSession(session: StudentSession): Promise<void> {
  await setCookie(SESSION_COOKIE, JSON.stringify(session), {
    maxAge: SESSION_COOKIE_MAX_AGE,
    sameSite: "strict",
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
}

export async function clearStoredSession(): Promise<void> {
  await deleteCookie(SESSION_COOKIE);
}

export const isSignedIn = (session: StudentSession | null) =>
  session !== null && session.kind !== "guest";

export const studentPortalSession = (netId: string): StudentSession => ({
  kind: "student-portal",
  token: STUDENT_PORTAL_SESSION_MARKER,
  netId,
});
