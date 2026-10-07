/** Username normalisation shared by sign-in and the demo check. */

import { DEMO_NET_ID, LOGIN_ID_DOMAIN } from "@/constants/auth";

export interface LoginIdentity {
  /** What the institution login expects: `ab1234@domain`. */
  loginId: string;
  /** The bare, lowercased username - the NetID the API binds sessions to. */
  netId: string;
}

/**
 * Accepts `ab1234` or `ab1234@domain`, any case, surrounding spaces. Returns
 * null for input with no usable username.
 */
export function normalizeLoginIdentity(input: string): LoginIdentity | null {
  const trimmed = input.trim();
  const netId = trimmed.split("@")[0]?.trim().toLowerCase() ?? "";
  if (!netId) return null;
  const loginId = trimmed.includes("@")
    ? trimmed.toLowerCase()
    : `${netId}${LOGIN_ID_DOMAIN}`;
  return { loginId, netId };
}

export const isDemoIdentity = (identity: LoginIdentity) =>
  identity.netId === DEMO_NET_ID;
