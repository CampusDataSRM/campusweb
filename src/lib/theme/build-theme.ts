/**
 * Theme building: palettes -> CSS variables, custom palette derivation, the
 * persisted preference format, and the pre-paint script.
 *
 * Flow:
 * - The root layout renders `themeStylesheet()` (all preset palettes as CSS
 *   variable blocks, keyed by `data-palette`) and `prePaintScript()`.
 * - The pre-paint script runs synchronously while the HTML parses, reads the
 *   theme cookie and sets `data-palette` - and, for a custom palette, its
 *   variables inline - before the first paint. No flash, no hydration error.
 * - At runtime ThemeProvider applies changes the same way and rewrites the
 *   cookie.
 *
 * A custom palette is stored fully resolved (every token's hex, in
 * THEME_TOKENS order, as one 270-character string), so the pre-paint script
 * needs no colour maths - it only assigns variables.
 */

import {
  CUSTOM_BASE,
  CUSTOM_EXTRAS,
  CUSTOM_RECIPE,
  DEFAULT_CUSTOM_COLOR,
  DEFAULT_PALETTE,
  PRESET_EXTRAS,
  PRESET_PALETTES,
  THEME_COOKIE,
  THEME_TOKENS,
  type PaletteExtras,
  type PaletteId,
  type PresetPaletteId,
  type ThemePalette,
  type ThemeToken,
} from "@/constants/theme";
import { hexToOklch, isHexColor, oklchToHex } from "@/lib/theme/color";

export interface ThemePreference {
  palette: PaletteId;
  /** The colour a custom palette is derived from (kept for every palette). */
  customColor: string;
}

export const DEFAULT_THEME_PREFERENCE: ThemePreference = {
  palette: DEFAULT_PALETTE,
  customColor: DEFAULT_CUSTOM_COLOR,
};

const isPresetPalette = (value: unknown): value is PresetPaletteId =>
  typeof value === "string" && value in PRESET_PALETTES;

const isPaletteId = (value: unknown): value is PaletteId =>
  value === "custom" || isPresetPalette(value);

/* ── custom palette derivation ── */

/**
 * Derive a complete palette from one colour. Hue comes from the colour;
 * lightness is fixed per role (CUSTOM_RECIPE) so every pair keeps its
 * contrast; chroma is capped by the picked colour, so a muted pick stays
 * muted. Status colours stay standard - green must still mean success.
 */
export function deriveCustomPalette(color: string): ThemePalette {
  const base = hexToOklch(color) ?? hexToOklch(DEFAULT_CUSTOM_COLOR)!;
  const hue = base.h;
  const secondaryHue = (hue + CUSTOM_RECIPE.secondaryHueOffset) % 360;
  const tone = (
    [l, c]: readonly [number, number],
    h: number,
    chromaCap = Infinity,
  ) => oklchToHex({ l, c: Math.min(c, chromaCap), h });

  const roles = CUSTOM_RECIPE.primary;
  const cap = Math.max(base.c, 0.02);
  const palette = { ...CUSTOM_BASE };

  for (const [token, lc] of Object.entries(CUSTOM_RECIPE.surfaces)) {
    palette[token as ThemeToken] = tone(lc, hue);
  }
  for (const [token, lc] of Object.entries(CUSTOM_RECIPE.text)) {
    palette[token as ThemeToken] = tone(lc, hue);
  }

  palette.primary = tone(roles.fill, hue, cap);
  palette["primary-hover"] = tone(roles.hover, hue, cap);
  palette["primary-accent"] = tone(roles.accent, hue, cap);
  palette["primary-container"] = tone(roles.container, hue);
  palette["on-primary-container"] = tone(roles.onContainer, hue);
  palette.ring = tone(roles.ring, hue, cap);

  palette.secondary = tone(roles.fill, secondaryHue, cap);
  palette["secondary-accent"] = tone(roles.accent, secondaryHue, cap);
  palette["secondary-container"] = tone(roles.container, secondaryHue);
  palette["on-secondary-container"] = tone(roles.onContainer, secondaryHue);

  palette["chart-1"] = tone(roles.accent, hue, cap);
  palette["chart-2"] = tone(roles.accent, secondaryHue, cap);
  return palette;
}

export function resolvePalette(preference: ThemePreference): ThemePalette {
  return preference.palette === "custom"
    ? deriveCustomPalette(preference.customColor)
    : PRESET_PALETTES[preference.palette];
}

/* ── CSS ── */

/** `--token: value;` declarations for one palette. */
export function paletteDeclarations(palette: ThemePalette): string {
  return THEME_TOKENS.map((token) => `--${token}:${palette[token]};`).join("");
}

const extrasDeclarations = (extras: PaletteExtras) =>
  `--backdrop:${extras.backdrop};--cta:${extras.cta};`;

/**
 * Every preset palette as a CSS block. The default palette is also `:root`,
 * so the page is themed even before the pre-paint script runs.
 */
export function themeStylesheet(): string {
  const blocks = (Object.keys(PRESET_PALETTES) as PresetPaletteId[]).map(
    (id) =>
      `[data-palette="${id}"]{${paletteDeclarations(PRESET_PALETTES[id])}${extrasDeclarations(PRESET_EXTRAS[id])}}`,
  );
  const fallback: PresetPaletteId = isPresetPalette(DEFAULT_PALETTE) ? DEFAULT_PALETTE : "campus-glow";
  return (
    `:root{${paletteDeclarations(PRESET_PALETTES[fallback])}${extrasDeclarations(PRESET_EXTRAS[fallback])}}` +
    blocks.join("") +
    `[data-palette="custom"]{${extrasDeclarations(CUSTOM_EXTRAS)}}`
  );
}

/* ── persisted preference (cookie) ── */

interface StoredTheme {
  /** Palette id. */
  p: PaletteId;
  /** Custom source colour. */
  c: string;
  /** Resolved custom palette: hex digits of every token, THEME_TOKENS order. */
  v?: string;
}

export function serializeThemePreference(preference: ThemePreference): string {
  const stored: StoredTheme = { p: preference.palette, c: preference.customColor };
  if (preference.palette === "custom") {
    const palette = deriveCustomPalette(preference.customColor);
    stored.v = THEME_TOKENS.map((token) => palette[token].slice(1)).join("");
  }
  return JSON.stringify(stored);
}

/** Parse the cookie value; anything malformed falls back to the default. */
export function parseThemePreference(
  raw: string | null | undefined,
): ThemePreference {
  if (!raw) return DEFAULT_THEME_PREFERENCE;
  try {
    const stored = JSON.parse(raw) as Partial<StoredTheme>;
    return {
      palette: isPaletteId(stored.p) ? stored.p : DEFAULT_PALETTE,
      customColor: isHexColor(stored.c)
        ? stored.c.toUpperCase()
        : DEFAULT_CUSTOM_COLOR,
    };
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

/* ── pre-paint script ── */

/**
 * Inline script for <head>. Reads the theme cookie and applies it to <html>
 * before the first paint. Self-contained and defensive: any failure leaves
 * the server default in place.
 */
export function prePaintScript(): string {
  const tokens = JSON.stringify(THEME_TOKENS);
  const presets = JSON.stringify(Object.keys(PRESET_PALETTES));
  return `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);if(!m)return;var t=JSON.parse(decodeURIComponent(m[1]));var d=document.documentElement;var k=${tokens};if(t.p==="custom"&&typeof t.v==="string"&&t.v.length===k.length*6){d.setAttribute("data-palette","custom");for(var i=0;i<k.length;i++){d.style.setProperty("--"+k[i],"#"+t.v.substr(i*6,6))}}else if(${presets}.indexOf(t.p)>-1){d.setAttribute("data-palette",t.p)}}catch(e){}})();`;
}
