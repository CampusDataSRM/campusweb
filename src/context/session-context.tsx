"use client";

/**
 * Global session context - the signed-in student (or guest/demo) and the
 * club portal token, persisted in the cookie store (lib/auth/session.ts,
 * lib/auth/club-session.ts).
 *
 * Hydration: cookies are read on mount, so the first server and client
 * renders both see "unknown". Consumers must treat `!hydrated` as unknown,
 * not signed out - proxy.ts has already routed on the cookie, so pages never
 * need to redirect while hydrating.
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
  clearClubToken,
  readClubToken,
  writeClubToken,
} from "@/lib/auth/club-session";
import {
  clearStoredSession,
  readSession,
  writeSession,
  type StudentSession,
} from "@/lib/auth/session";

export interface SessionContextValue {
  session: StudentSession | null;
  clubToken: string | null;
  hydrated: boolean;
  startSession(session: StudentSession): Promise<void>;
  endSession(): Promise<void>;
  startClubSession(token: string): Promise<void>;
  endClubSession(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [clubToken, setClubToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([readSession(), readClubToken()]).then(
      ([storedSession, storedClubToken]) => {
        if (!active) return;
        setSession(storedSession);
        setClubToken(storedClubToken);
        setHydrated(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const startSession = useCallback(async (next: StudentSession) => {
    await writeSession(next);
    setSession(next);
  }, []);

  const endSession = useCallback(async () => {
    await clearStoredSession();
    setSession(null);
  }, []);

  const startClubSession = useCallback(async (token: string) => {
    await writeClubToken(token);
    setClubToken(token);
  }, []);

  const endClubSession = useCallback(async () => {
    await clearClubToken();
    setClubToken(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      clubToken,
      hydrated,
      startSession,
      endSession,
      startClubSession,
      endClubSession,
    }),
    [
      session,
      clubToken,
      hydrated,
      startSession,
      endSession,
      startClubSession,
      endClubSession,
    ],
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
