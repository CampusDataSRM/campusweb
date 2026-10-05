/**
 * JWT inspection utilities — decode, expiry, and validity checks.
 *
 * Client-side tokens are *inspected*, never *verified*: checking a signature
 * requires the signing key, which only the backend has (a JWT's signature
 * exists precisely so clients can't forge one). These helpers therefore do
 * structural decoding plus temporal checks — all the frontend needs to decide
 * "is this token still usable, or should the user re-authenticate?". The
 * backend re-validates the signature on every request regardless.
 *
 * Source of tokens in this app: the club-login flow (`ClubLoginResponse.token`),
 * sent back to club endpoints as `Authorization: Bearer`. Persistence
 * (cookie vs storage) is an integration-time decision — these helpers stay
 * pure: token string in, answer out, no `window`/storage access, identical
 * behavior on the server and in the browser.
 */

/** Standard RFC 7519 claims these utilities understand; custom claims ride along. */
export interface JwtPayload {
  /** Subject — e.g. the club id the token was issued for. */
  sub?: string;
  /** Issued at, seconds since epoch. */
  iat?: number;
  /** Not before, seconds since epoch — token is invalid before this. */
  nbf?: number;
  /** Expiry, seconds since epoch. Absent means the token never expires. */
  exp?: number;
  [claim: string]: unknown;
}

export interface DecodedJwt<T extends JwtPayload = JwtPayload> {
  /** JOSE header — typically `{ alg, typ }`. */
  header: Record<string, unknown>;
  payload: T;
  /** Signature segment as-is (opaque to the client — verification is backend-only). */
  signature: string;
}

/**
 * Decode a JWT's header and payload without verifying anything.
 *
 * Accepts the raw token or a full `Authorization` header value (`Bearer ` is
 * stripped). Returns `null` for anything that is not a structurally complete
 * JWT: nullish/empty input, wrong segment count, undecodable base64url, or
 * non-object JSON. A `null` return means "unusable", never "throw".
 */
export function decodeJwt<T extends JwtPayload = JwtPayload>(
  token: string | null | undefined,
): DecodedJwt<T> | null {
  if (!token) return null;

  const raw = token.trim().replace(/^Bearer\s+/i, "");
  const [headerSegment, payloadSegment, signature] = raw.split(".");
  if (!headerSegment || !payloadSegment || !signature) return null;

  try {
    const header = JSON.parse(decodeBase64Url(headerSegment)) as Record<
      string,
      unknown
    >;
    const payload = JSON.parse(decodeBase64Url(payloadSegment)) as T;

    if (
      typeof header !== "object" ||
      header === null ||
      Array.isArray(header) ||
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return null;
    }

    return { header, payload, signature };
  } catch {
    return null;
  }
}

/**
 * Token expiry as epoch milliseconds, or `null` when the token is malformed
 * or carries no `exp` claim (RFC 7519 makes `exp` optional).
 */
export function getJwtExpiry(token: string | null | undefined): number | null {
  const exp = decodeJwt(token)?.payload.exp;
  return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null;
}

/**
 * Whether the token is expired — or unusable at all (nullish/malformed), so a
 * single boolean safely gates "may I call club endpoints with this?".
 * A structurally valid token with no `exp` claim is treated as non-expiring.
 *
 * `leewaySeconds` absorbs client/server clock skew (e.g. 30 treats tokens as
 * valid up to 30s past their `exp`).
 */
export function isJwtExpired(
  token: string | null | undefined,
  leewaySeconds = 0,
): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return true;

  const { exp } = decoded.payload;
  // Valid token without exp: RFC 7519 makes the claim optional — non-expiring.
  if (typeof exp !== "number" || !Number.isFinite(exp)) return false;
  return Date.now() >= (exp + leewaySeconds) * 1000;
}

/**
 * Whether the token is usable right now: structurally decodable, not expired
 * (`exp`), and already within its validity window (`nbf`). Same leeway
 * semantics as `isJwtExpired`.
 */
export function isJwtValid(
  token: string | null | undefined,
  leewaySeconds = 0,
): boolean {
  const decoded = decodeJwt(token);
  if (!decoded) return false;

  const { exp, nbf } = decoded.payload;
  const now = Date.now();
  if (typeof nbf === "number" && Number.isFinite(nbf)) {
    if (now < (nbf - leewaySeconds) * 1000) return false;
  }
  if (typeof exp === "number" && Number.isFinite(exp)) {
    if (now >= (exp + leewaySeconds) * 1000) return false;
  }
  return true;
}

/**
 * Whether a structurally valid token will expire within `withinSeconds` —
 * for proactive re-auth/refresh flows. Malformed tokens and tokens without
 * `exp` return `false`; gate those with `isJwtValid` separately.
 */
export function isJwtExpiringSoon(
  token: string | null | undefined,
  withinSeconds: number,
  leewaySeconds = 0,
): boolean {
  const exp = decodeJwt(token)?.payload.exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return false;
  return Date.now() >= (exp + leewaySeconds - withinSeconds) * 1000;
}

/** base64url (RFC 4648 §5, unpadded) → UTF-8 string. Throws on bad input. */
function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
