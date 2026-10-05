/**
 * Club portal session: the JWT from POST /auth/club-login, kept in the cookie
 * store and sent as `Authorization: Bearer`. Expiry is checked client-side
 * (lib/jwt.ts) so an expired token signs the club out instead of failing
 * every request; the backend still verifies the signature.
 */

import {
  CLUB_SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
} from "@/constants/auth";
import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";
import { getJwtExpiry, isJwtValid } from "@/lib/jwt";

/** Seconds of clock skew tolerated between this device and the API. */
const LEEWAY_SECONDS = 30;

export const isClubTokenUsable = (token: string | null | undefined) =>
  isJwtValid(token, LEEWAY_SECONDS);

export async function readClubToken(): Promise<string | null> {
  const token = await getCookie(CLUB_SESSION_COOKIE);
  return isClubTokenUsable(token) ? token : null;
}

export async function writeClubToken(token: string): Promise<void> {
  // Never outlive the token itself.
  const expiry = getJwtExpiry(token);
  const maxAge = expiry
    ? Math.max(0, Math.floor((expiry - Date.now()) / 1000))
    : SESSION_COOKIE_MAX_AGE;
  await setCookie(CLUB_SESSION_COOKIE, token, {
    maxAge,
    sameSite: "strict",
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
}

export async function clearClubToken(): Promise<void> {
  await deleteCookie(CLUB_SESSION_COOKIE);
}
