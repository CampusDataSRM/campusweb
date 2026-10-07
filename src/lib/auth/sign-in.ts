/**
 * Sign-in orchestration - the app's parallel login, for the web.
 *
 * 1. `campusdemo` signs in against the demo endpoints only.
 * 2. Everyone else: Academia (through the backend, /auth/login) and the
 *    Student Portal are tried at the same time.
 *    - Academia answers first and succeeds: give the Student Portal
 *      STUDENT_PORTAL_GRACE_MS to report a first-year account; a first-year
 *      uses the Student Portal session, anyone else Academia's.
 *    - Otherwise wait for the Student Portal. First-years (semester 1-2) are
 *      signed in on it alone - Academia's outcome is ignored. Everyone else
 *      needs Academia.
 *    - Both failed: Academia's error is reported, unless Academia doesn't
 *      know the account (a first-year) - then the Student Portal's is. The
 *      portal's "login failed" never overrides an Academia timeout or
 *      outage, since it also fires for accounts that aren't on the portal.
 *
 * The Student Portal login runs with `withCredentials` so the browser keeps
 * the HttpOnly session cookie the API sets.
 */

import { LOGIN_TIMEOUT_MS, STUDENT_PORTAL_GRACE_MS } from "@/constants/auth";
import {
  isDemoIdentity,
  normalizeLoginIdentity,
  type LoginIdentity,
} from "@/lib/auth/credentials";
import { studentPortalSession, type StudentSession } from "@/lib/auth/session";
import {
  combineFailures,
  fromFailureBody,
  SignInError,
  toSignInError,
} from "@/lib/auth/sign-in-error";
import { postDemoLogin } from "@/network-calls/demo";
import { postLogin } from "@/network-calls/login";
import { postStudentPortalLogin } from "@/network-calls/studentPortalLogin";
import type {
  LoginResponse,
  StudentPortalLoginResponse,
} from "@/network-calls/types";

export interface Credentials {
  username: string;
  password: string;
}

type Attempt<T> = { ok: true; value: T } | { ok: false; error: SignInError };

const settle = <T>(promise: Promise<T>): Promise<Attempt<T>> =>
  promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error: toSignInError(error) }),
  );

const delay = (ms: number) =>
  new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));

/** First-year accounts (semester 1-2) live on the Student Portal only. */
export function isFirstYearAccount(
  response: StudentPortalLoginResponse & { registration_number?: string },
): boolean {
  const semester = Number(response.semester_id);
  if (semester === 1 || semester === 2) return true;
  // Older payloads sent no semester; RA26 is the 2026 first-year intake.
  return (
    !Number.isInteger(semester) &&
    /^RA26/i.test(response.registration_number ?? "")
  );
}

/** The Academia session string, or a classified failure. */
async function academiaLogin(
  identity: LoginIdentity,
  password: string,
): Promise<StudentSession> {
  const response: LoginResponse & { cookies?: string } = await postLogin(
    { username: identity.loginId, password },
    { timeout: LOGIN_TIMEOUT_MS },
  );
  const cookies = response.Cookies ?? response.cookies;
  if (cookies)
    return {
      kind: "academia",
      token: cookies,
      netId: identity.netId,
      ...(response.sessionToken ? { sessionToken: response.sessionToken } : {}),
    };
  // A 200 that still failed: read the body the same way as an error response.
  throw fromFailureBody(response);
}

async function studentPortalLogin(identity: LoginIdentity, password: string) {
  const response = await postStudentPortalLogin(
    { net_id: identity.netId, password },
    { withCredentials: true, timeout: LOGIN_TIMEOUT_MS },
  );
  if (response.status !== "success") throw fromFailureBody(response);
  return response;
}

async function demoSignIn(
  identity: LoginIdentity,
  password: string,
): Promise<StudentSession> {
  try {
    const response = await postDemoLogin(
      { net_id: identity.netId, password },
      { timeout: LOGIN_TIMEOUT_MS },
    );
    if (!response.demo_token) throw new SignInError("unavailable");
    return { kind: "demo", token: response.demo_token, netId: identity.netId };
  } catch (error) {
    throw toSignInError(error);
  }
}

export async function signIn({
  username,
  password,
}: Credentials): Promise<StudentSession> {
  const identity = normalizeLoginIdentity(username);
  if (!identity || !password) {
    throw new SignInError("unknown", "Enter your username and password.");
  }
  if (isDemoIdentity(identity)) return demoSignIn(identity, password);

  const academia = settle(academiaLogin(identity, password));
  const portal = settle(studentPortalLogin(identity, password));

  const first = await Promise.race([
    academia.then((result) => ({ source: "academia" as const, result })),
    portal.then((result) => ({ source: "portal" as const, result })),
  ]);

  if (first.source === "academia" && first.result.ok) {
    const quickPortal = await Promise.race([
      portal,
      delay(STUDENT_PORTAL_GRACE_MS),
    ]);
    return quickPortal?.ok && isFirstYearAccount(quickPortal.value)
      ? studentPortalSession(identity.netId, quickPortal.value.session_token)
      : first.result.value;
  }

  const portalResult = await portal;
  if (portalResult.ok && isFirstYearAccount(portalResult.value)) {
    return studentPortalSession(
      identity.netId,
      portalResult.value.session_token,
    );
  }

  const academiaResult = await academia;
  if (academiaResult.ok) return academiaResult.value;

  // Portal signed in but says this isn't a first-year, and Academia failed:
  // Academia is their login, so its error is the one that matters.
  const error = portalResult.ok
    ? academiaResult.error
    : combineFailures(academiaResult.error, portalResult.error);
  if (portalResult.ok)
    error.legs = { academia: academiaResult.error.kind, portal: "ok" };
  if (process.env.NODE_ENV !== "production") {
    console.info("[sign-in] both logins failed", error.legs);
  }
  throw error;
}
