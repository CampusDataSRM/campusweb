/**
 * Sign-in failures, classified and worded for students.
 *
 * Raw backend text is never shown as-is: messages are mapped by status/code
 * to plain wording that asks for a username (the website never names the
 * institution or says "NetID"). When both logins fail, the more useful error
 * wins - a wrong password beats "service busy".
 */

import { ApiError } from "@/lib/api/axios-client";

export type SignInErrorKind =
  | "unknown"
  | "network"
  | "timeout"
  | "unavailable"
  | "rate-limited"
  | "captcha"
  | "old-password"
  | "not-found"
  | "credentials";

/** Higher wins when two errors compete. */
const PRIORITY: Record<SignInErrorKind, number> = {
  unknown: 0,
  network: 1,
  timeout: 2,
  unavailable: 2,
  "rate-limited": 3,
  captcha: 4,
  "not-found": 5,
  "old-password": 6,
  credentials: 7,
};

const MESSAGES: Record<SignInErrorKind, string> = {
  unknown: "Sign-in didn't go through. Please try again.",
  network: "Couldn't reach the server. Check your connection and try again.",
  timeout:
    "Sign-in is taking longer than usual. The portal is slow right now - please try again.",
  unavailable: "Sign-in is busy right now. Please try again shortly.",
  "rate-limited":
    "Too many sign-in attempts. Please wait a minute and try again.",
  captcha:
    "Too many attempts on this account. Wait a few minutes, then try again.",
  "old-password": "That's an old password. Please enter your current password.",
  "not-found":
    "We couldn't find an account with this username. Check it and try again.",
  credentials: "Incorrect username or password.",
};

/** Which login produced the error, when both were tried. */
export interface SignInLegs {
  academia: SignInErrorKind;
  portal: SignInErrorKind | "ok";
}

export class SignInError extends Error {
  readonly kind: SignInErrorKind;
  /** Both legs' outcomes, for diagnostics - never shown to the reader. */
  legs?: SignInLegs;

  constructor(kind: SignInErrorKind, message: string = MESSAGES[kind]) {
    super(message);
    this.name = "SignInError";
    this.kind = kind;
  }
}

interface ErrorBody {
  code?: string;
  message?: string;
  captcha_required?: boolean;
  passResponse?: { code?: string; message?: string };
}

const bodyOf = (error: ApiError): ErrorBody =>
  typeof error.data === "object" && error.data !== null
    ? (error.data as ErrorBody)
    : {};

/** Classify anything thrown by a login request. */
export function toSignInError(error: unknown): SignInError {
  if (error instanceof SignInError) return error;
  if (!(error instanceof ApiError)) return new SignInError("unknown");
  if (error.status === undefined) {
    return new SignInError(
      /timeout/i.test(error.message) ? "timeout" : "network",
    );
  }

  const body = bodyOf(error);
  const text = `${body.message ?? ""} ${body.passResponse?.message ?? ""}`;

  if (body.captcha_required) return new SignInError("captcha");
  if (/old password/i.test(text) || body.passResponse?.code === "P201") {
    return new SignInError("old-password");
  }
  if (body.code === "academia_account_not_found" || error.status === 404) {
    return new SignInError("not-found");
  }
  if (
    error.status === 401 ||
    body.code === "academia_credentials_rejected" ||
    /incorrect|invalid (?:password|credentials)|did not accept/i.test(text)
  ) {
    return new SignInError("credentials");
  }
  if (error.status === 429) return new SignInError("rate-limited");
  return new SignInError("unavailable");
}

/** Classify a 200 response whose body still reports a failed login. */
export function fromFailureBody(response: unknown): SignInError {
  const body = (
    typeof response === "object" && response !== null ? response : {}
  ) as ErrorBody & { Message?: string };
  const text = `${body.message ?? ""} ${body.Message ?? ""} ${body.passResponse?.message ?? ""}`;
  if (body.captcha_required) return new SignInError("captcha");
  if (/old password/i.test(text) || body.passResponse?.code === "P201") {
    return new SignInError("old-password");
  }
  if (
    body.code === "academia_account_not_found" ||
    /not recognise|not found/i.test(text)
  ) {
    return new SignInError("not-found");
  }
  if (
    body.code === "academia_credentials_rejected" ||
    /incorrect|invalid (?:password|credentials)|did not accept|wrong password/i.test(
      text,
    )
  ) {
    return new SignInError("credentials");
  }
  return new SignInError("unavailable");
}

export function moreUseful(a: SignInError, b: SignInError): SignInError {
  return PRIORITY[b.kind] > PRIORITY[a.kind] ? b : a;
}

/** The error is about the account itself, not about the service being slow or down. */
export const isDefinitive = (error: SignInError) =>
  PRIORITY[error.kind] >= PRIORITY["rate-limited"];

/**
 * When both logins failed, which error to show.
 *
 * The Student Portal answers 401 "login failed" for a wrong password AND for
 * an account that was never on the portal, so for second-years and up its
 * failure says nothing about their password. Academia's verdict wins unless
 * Academia says the account doesn't exist there - then this is a first-year
 * and the portal's error is the real one.
 */
export function combineFailures(
  academia: SignInError,
  portal: SignInError,
): SignInError {
  const chosen = academia.kind === "not-found" ? portal : academia;
  // Two vague failures: prefer whichever says more, as before.
  const result =
    !isDefinitive(academia) && !isDefinitive(portal)
      ? moreUseful(academia, portal)
      : chosen;
  const error = new SignInError(result.kind, result.message);
  error.legs = { academia: academia.kind, portal: portal.kind };
  return error;
}
