"use client";

/**
 * Global session context — the app-wide store for authentication session
 * data, persisted per-tab through src/lib/session-storage.ts.
 *
 * Scope deliberately limited to what the endpoint layer actually consumes
 * (global header wiring is the planned integration step):
 * - `clubToken` — JWT from POST /auth/club-login, sent as `Authorization: Bearer`
 * - `academiaCookies` — harvested Academia cookie string from POST /auth/login,
 *   sent as `X-CSRF-Token` on authenticated student endpoints
 * - `netId` — student net id, sent as `X-Net-ID` by force-refresh
 *
 * Storage layout: the whole session as one JSON object under the single key
 * `session`, so updates are atomic and hydration is one read.
 *
 * Hydration: sessionStorage exists only in the browser, so the first server
 * render and the first client render both see the empty session. The mount
 * effect then loads persisted values and flips `hydrated`. Consumers must
 * treat `!hydrated` as "unknown", not "logged out", to avoid flashing a
 * redirect on reload. No password or Academia credentials are ever stored
 * here — only derived session material the API layer needs.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  sessionDelete,
  sessionGet,
  sessionSet,
} from "@/lib/session-storage";

const SESSION_KEY = "session";

export interface SessionData {
  /** Club JWT from POST /auth/club-login — sent as `Authorization: Bearer`. */
  clubToken: string | null;
  /** Academia cookie string from POST /auth/login — sent as `X-CSRF-Token`. */
  academiaCookies: string | null;
  /** Student net id (e.g. "ac2741") — sent as `X-Net-ID` by force-refresh. */
  netId: string | null;
}

export interface SessionContextValue extends SessionData {
  /** True once the persisted session (if any) has been loaded client-side. */
  hydrated: boolean;
  /** Merge a partial session update into state and sessionStorage. Pass null to clear a field. */
  updateSession(partial: Partial<SessionData>): void;
  /** Wipe the entire session (state + storage) — the logout orchestration point. */
  clearSession(): void;
}

const EMPTY_SESSION: SessionData = {
  clubToken: null,
  academiaCookies: null,
  netId: null,
};

/** Only accept string|null for each field — sessionStorage content is not trusted. */
function sanitizeStored(value: unknown): SessionData {
  if (typeof value !== "object" || value === null) return EMPTY_SESSION;
  const source = value as Record<string, unknown>;
  const field = (name: keyof SessionData): string | null =>
    typeof source[name] === "string" ? (source[name] as string) : null;
  return {
    clubToken: field("clubToken"),
    academiaCookies: field("academiaCookies"),
    netId: field("netId"),
  };
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData>(EMPTY_SESSION);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(sanitizeStored(sessionGet(SESSION_KEY)));
    setHydrated(true);
  }, []);

  const updateSession = useCallback(
    (partial: Partial<SessionData>) => {
      setSession((current) => {
        const next = { ...current, ...partial };
        sessionSet(SESSION_KEY, next);
        return next;
      });
    },
    [],
  );

  const clearSession = useCallback(() => {
    sessionDelete(SESSION_KEY);
    setSession(EMPTY_SESSION);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ ...session, hydrated, updateSession, clearSession }),
    [session, hydrated, updateSession, clearSession],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Access the global session. Throws outside `<SessionProvider>`. */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within <SessionProvider>");
  }
  return context;
}
