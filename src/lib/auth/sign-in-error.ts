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
  unavailable: "Sign-in is busy right now. Please try again shortly.",
  "rate-limited":
    "Too many sign-in attempts. Please wait a minute and try again.",
  captcha:
    "Too many attempts on this account. Wait a few minutes, then try again.",
  "old-password":
    "That's an old password. Please enter your current password.",
  "not-found":
    "We couldn't find an account with this username. Check it and try again.",
  credentials: "Incorrect username or password.",
};

export class SignInError extends Error {
  readonly kind: SignInErrorKind;

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
  if (error.status === undefined) return new SignInError("network");

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

export function moreUseful(a: SignInError, b: SignInError): SignInError {
  return PRIORITY[b.kind] > PRIORITY[a.kind] ? b : a;
}
