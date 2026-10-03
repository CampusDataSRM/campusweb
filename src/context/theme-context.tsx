"use client";

/**
 * Theme context - the user's palette choice, applied and persisted.
 *
 * The pre-paint script has already themed the page from the cookie before
 * React runs; this provider only reads the same cookie into state (for the
 * picker) and owns changes: apply to the document, then persist. Components
 * never read palette values from here for styling - they use the CSS-variable
 * utilities. `palette` is exposed for canvas/WebGL code that needs real hex.
 *
 * Until `hydrated`, the preference is the default; the picker treats that as
 * "loading", so it never flashes the wrong selection.
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
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type PaletteId,
  type ThemePalette,
} from "@/constants/theme";
import { getCookie, setCookie } from "@/lib/cookies";
import { applyThemeWithTransition } from "@/lib/theme/apply-theme";
import {
  DEFAULT_THEME_PREFERENCE,
  parseThemePreference,
  resolvePalette,
  serializeThemePreference,
  type ThemePreference,
} from "@/lib/theme/build-theme";
import { isHexColor } from "@/lib/theme/color";

export interface ThemeContextValue {
  preference: ThemePreference;
  /** Resolved hex values of the active palette. */
  palette: ThemePalette;
  hydrated: boolean;
  setPalette(palette: PaletteId): void;
  /** Set the custom source colour and switch to the custom palette. */
  setCustomColor(color: string): void;
  reset(): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(preference: ThemePreference): void {
  void setCookie(THEME_COOKIE, serializeThemePreference(preference), {
    maxAge: THEME_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(
    DEFAULT_THEME_PREFERENCE,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void getCookie(THEME_COOKIE).then((raw) => {
      if (!active) return;
      setPreference(parseThemePreference(raw));
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback((next: ThemePreference) => {
    applyThemeWithTransition(next);
    persist(next);
    setPreference(next);
  }, []);

  const setPalette = useCallback(
    (palette: PaletteId) => commit({ ...preference, palette }),
    [commit, preference],
  );

  const setCustomColor = useCallback(
    (color: string) => {
      if (!isHexColor(color)) return;
      commit({ palette: "custom", customColor: color.toUpperCase() });
    },
    [commit],
  );

  const reset = useCallback(
    () => commit(DEFAULT_THEME_PREFERENCE),
    [commit],
  );

  const palette = useMemo(() => resolvePalette(preference), [preference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      palette,
      hydrated,
      setPalette,
      setCustomColor,
      reset,
    }),
    [preference, palette, hydrated, setPalette, setCustomColor, reset],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within <ThemeProvider>");
  return context;
}
