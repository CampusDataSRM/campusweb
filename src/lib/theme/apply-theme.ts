/**
 * Apply a theme preference to the live document - the runtime counterpart of
 * the pre-paint script (build-theme.ts), and kept in step with it: presets are
 * a `data-palette` attribute backed by the generated stylesheet; a custom
 * palette is the `custom` attribute plus every token set inline on <html>.
 *
 * Browser only.
 */

import { THEME_TOKENS } from "@/constants/theme";
import {
  deriveCustomPalette,
  type ThemePreference,
} from "@/lib/theme/build-theme";

export function applyThemeToDocument(preference: ThemePreference): void {
  const root = document.documentElement;
  root.setAttribute("data-palette", preference.palette);

  if (preference.palette === "custom") {
    const palette = deriveCustomPalette(preference.customColor);
    for (const token of THEME_TOKENS) {
      root.style.setProperty(`--${token}`, palette[token]);
    }
    return;
  }
  // A preset owns its variables through the stylesheet; clear any inline
  // custom values so they cannot shadow it.
  for (const token of THEME_TOKENS) root.style.removeProperty(`--${token}`);
}

let themeChangeRevision = 0;

/**
 * Apply a theme the user just picked with a short crossfade (View
 * Transitions), so the whole page eases into the new palette. Falls back to
 * an instant switch where unsupported or when reduced motion is on.
 */
export function applyThemeWithTransition(preference: ThemePreference): void {
  const revision = ++themeChangeRevision;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition !== "function") {
    applyThemeToDocument(preference);
    return;
  }
  document.startViewTransition(() => {
    // Rapid choices must not let an older deferred transition win.
    if (revision === themeChangeRevision) applyThemeToDocument(preference);
  });
}

/** Current value of a token as the browser resolved it - for canvas/WebGL. */
export function readThemeToken(token: (typeof THEME_TOKENS)[number]): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${token}`)
    .trim();
}
