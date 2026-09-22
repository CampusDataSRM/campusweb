/**
 * Centralized cookie access for the whole app.
 *
 * One async API for every execution context:
 * - Browser: reads/writes `document.cookie` directly.
 * - Server Components (read) and Server Functions / Route Handlers (write):
 *   goes through `next/headers` — dynamically imported so client bundles
 *   never pull the server-only module into their graph.
 *
 * Cookies have no separate "update" operation: `setCookie` upserts — writing
 * an existing name overwrites its value. Server-side writes are only legal
 * where an HTTP response can carry `Set-Cookie` (Server Functions / Route
 * Handlers); calling them during Server Component rendering throws by design
 * (see node_modules/next/dist/docs — cookies is a request-time API).
 */

export interface CookieOptions {
  /** Lifespan in seconds from now. */
  maxAge?: number;
  /** Absolute expiry date. Browsers prefer `maxAge` when both are set. */
  expires?: Date;
  /** URL scope. Defaults to `/` on both server and client paths. */
  path?: string;
  domain?: string;
  /** Send only over HTTPS. Set for auth cookies in production. */
  secure?: boolean;
  /**
   * Server-only (Server Functions / Route Handlers). Ignored in the browser:
   * `document.cookie` cannot create httpOnly cookies by design.
   */
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
}

const isServer = () => typeof window === "undefined";

/** Server path only. Dynamic import keeps `next/headers` out of client bundles. */
async function serverCookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

/** Parse `document.cookie` into a decoded name→value record. */
function parseClientCookies(): Record<string, string> {
  const jar: Record<string, string> = {};
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    const raw = part.slice(eq + 1);
    try {
      jar[decodeURIComponent(name)] = decodeURIComponent(raw);
    } catch {
      jar[name] = raw;
    }
  }
  return jar;
}

/** Build a `Set-Cookie`-style string for `document.cookie` assignment. */
function serializeClientCookie(
  name: string,
  value: string,
  options?: CookieOptions,
): string {
  const attrs = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `path=${options?.path ?? "/"}`,
  ];
  if (options?.domain) attrs.push(`domain=${options.domain}`);
  if (options?.maxAge !== undefined) attrs.push(`max-age=${options.maxAge}`);
  if (options?.expires) attrs.push(`expires=${options.expires.toUTCString()}`);
  if (options?.secure) attrs.push("secure");
  if (options?.sameSite) attrs.push(`samesite=${options.sameSite}`);
  return attrs.join("; ");
}

/** Read one cookie. Resolves to `null` when missing. */
export async function getCookie(name: string): Promise<string | null> {
  if (isServer()) {
    const store = await serverCookieStore();
    return store.get(name)?.value ?? null;
  }
  return parseClientCookies()[name] ?? null;
}

/** Read every visible cookie as a name→value record. */
export async function getAllCookies(): Promise<Record<string, string>> {
  if (isServer()) {
    const store = await serverCookieStore();
    return Object.fromEntries(
      store.getAll().map((cookie) => [cookie.name, cookie.value]),
    );
  }
  return parseClientCookies();
}

export async function hasCookie(name: string): Promise<boolean> {
  if (isServer()) {
    const store = await serverCookieStore();
    return store.has(name);
  }
  return parseClientCookies()[name] !== undefined;
}

/**
 * Add or update a cookie (same operation — cookies upsert).
 *
 * Browser: `document.cookie`. Server: outgoing `Set-Cookie`; only legal in
 * Server Functions / Route Handlers, throws during RSC rendering.
 */
export async function setCookie(
  name: string,
  value: string,
  options?: CookieOptions,
): Promise<void> {
  if (isServer()) {
    const store = await serverCookieStore();
    store.set({ name, value, path: "/", ...options });
    return;
  }
  document.cookie = serializeClientCookie(name, value, options);
}

/**
 * Delete a cookie. Pass the same `path`/`domain` the cookie was set with —
 * a mismatched scope leaves the original in place.
 */
export async function deleteCookie(
  name: string,
  options?: Pick<CookieOptions, "path" | "domain">,
): Promise<void> {
  if (isServer()) {
    const store = await serverCookieStore();
    store.delete(name);
    return;
  }
  // Expire both ways (max-age + past date) for belt-and-suspenders across
  // browsers; the empty value mirrors Next's own server-side delete.
  document.cookie = serializeClientCookie(name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}
