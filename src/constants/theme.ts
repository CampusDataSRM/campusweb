/**
 * The theme: every colour the app uses, and nothing else may define one.
 *
 * Components never name a colour. They use semantic Tailwind utilities
 * (`bg-surface-container`, `text-on-surface-muted`, `bg-primary`...) that
 * resolve to CSS variables, and those variables are generated from the
 * palettes below (see lib/theme/build-theme.ts). Switching palette swaps the
 * variables; no component re-renders.
 *
 * Roles follow Material 3's fill/on-colour pairing over a dark surface ladder
 * that gets lighter with elevation. Every pair meets WCAG AA:
 * - text on surfaces: on-surface 16.7:1, on-surface-muted 8.1:1,
 *   on-surface-brand 10.3:1 (the brand's #91C3E7);
 * - labels on fills: white on primary #0A6CD6 5.1:1, on secondary #8544F2
 *   5.1:1 - the raw brand #0094FF manages only 3.1:1 with white, so it is
 *   kept for accents and charts;
 * - outline 3.9:1 for control boundaries (WCAG 1.4.11), ring 7.9:1.
 */

export const THEME_TOKENS = [
  "surface-lowest",
  "surface",
  "surface-low",
  "surface-container",
  "surface-high",
  "surface-highest",
  "surface-bright",
  "on-surface",
  "on-surface-brand",
  "on-surface-muted",
  "on-surface-subtle",
  "outline",
  "outline-variant",
  "primary",
  "on-primary",
  "primary-hover",
  "primary-accent",
  "primary-container",
  "on-primary-container",
  "secondary",
  "on-secondary",
  "secondary-accent",
  "secondary-container",
  "on-secondary-container",
  "success",
  "on-success",
  "success-accent",
  "success-container",
  "on-success-container",
  "warning",
  "on-warning",
  "warning-accent",
  "warning-container",
  "on-warning-container",
  "danger",
  "on-danger",
  "danger-accent",
  "danger-container",
  "on-danger-container",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemePalette = Record<ThemeToken, string>;

/** Status pairs shared by every palette: they carry meaning, not brand. */
const STATUS = {
  success: "#15803D",
  "on-success": "#FFFFFF",
  "success-accent": "#4ADE80",
  "success-container": "#0F2A1C",
  "on-success-container": "#BBF7D0",
  warning: "#F59E0B",
  "on-warning": "#1A1200",
  "warning-accent": "#FBBF24",
  "warning-container": "#2E2106",
  "on-warning-container": "#FDE68A",
  danger: "#DC2626",
  "on-danger": "#FFFFFF",
  "danger-accent": "#F87171",
  "danger-container": "#3B1214",
  "on-danger-container": "#FECACA",
} satisfies Partial<ThemePalette>;

/** Campus - the default. Cool navy surfaces, the brand blue and violet. */
const CAMPUS: ThemePalette = {
  "surface-lowest": "#06080C",
  surface: "#0A0D12",
  "surface-low": "#10141A",
  "surface-container": "#151A21",
  "surface-high": "#1B212A",
  "surface-highest": "#232A35",
  "surface-bright": "#2C3441",
  "on-surface": "#E8EEF5",
  "on-surface-brand": "#91C3E7",
  "on-surface-muted": "#9AA8BA",
  "on-surface-subtle": "#64748B",
  outline: "#64707F",
  "outline-variant": "#262E3A",
  primary: "#0A6CD6",
  "on-primary": "#FFFFFF",
  "primary-hover": "#0B5FBD",
  "primary-accent": "#3DA5FF",
  "primary-container": "#0B2A4A",
  "on-primary-container": "#CFE5FF",
  secondary: "#8544F2",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#B88AFF",
  "secondary-container": "#2A1747",
  "on-secondary-container": "#EBDDFF",
  ...STATUS,
  ring: "#4DABFF",
  "chart-1": "#0094FF",
  "chart-2": "#9747FF",
  "chart-3": "#4ADE80",
  "chart-4": "#FBBF24",
  "chart-5": "#F87171",
};

/** Dark - neutral zinc surfaces, with the brand kept for actions only. */
const DARK: ThemePalette = {
  ...CAMPUS,
  "surface-lowest": "#050506",
  surface: "#09090B",
  "surface-low": "#0F0F12",
  "surface-container": "#141417",
  "surface-high": "#1B1B1F",
  "surface-highest": "#242428",
  "surface-bright": "#2E2E33",
  "on-surface": "#F4F4F5",
  "on-surface-brand": "#D4D4D8",
  "on-surface-muted": "#A1A1AA",
  "on-surface-subtle": "#71717A",
  outline: "#6B6B73",
  "outline-variant": "#27272A",
  "primary-container": "#18263A",
  "secondary-container": "#221A33",
};

/** Monochrome - no hue at all; status keeps its colour so meaning survives. */
const MONOCHROME: ThemePalette = {
  ...STATUS,
  "surface-lowest": "#050505",
  surface: "#0A0A0A",
  "surface-low": "#0F0F0F",
  "surface-container": "#141414",
  "surface-high": "#1C1C1C",
  "surface-highest": "#262626",
  "surface-bright": "#303030",
  "on-surface": "#EDEDED",
  "on-surface-brand": "#FFFFFF",
  "on-surface-muted": "#A1A1A1",
  "on-surface-subtle": "#6E6E6E",
  outline: "#6E6E6E",
  "outline-variant": "#2E2E2E",
  primary: "#EDEDED",
  "on-primary": "#0A0A0A",
  "primary-hover": "#D4D4D4",
  "primary-accent": "#FFFFFF",
  "primary-container": "#262626",
  "on-primary-container": "#F5F5F5",
  secondary: "#A3A3A3",
  "on-secondary": "#0A0A0A",
  "secondary-accent": "#D4D4D4",
  "secondary-container": "#1F1F1F",
  "on-secondary-container": "#F5F5F5",
  ring: "#FFFFFF",
  "chart-1": "#F5F5F5",
  "chart-2": "#A3A3A3",
  "chart-3": "#737373",
  "chart-4": "#D4D4D4",
  "chart-5": "#525252",
};

export const PRESET_PALETTES = {
  campus: CAMPUS,
  dark: DARK,
  monochrome: MONOCHROME,
} as const;

export type PresetPaletteId = keyof typeof PRESET_PALETTES;
export type PaletteId = PresetPaletteId | "custom";

export const DEFAULT_PALETTE: PaletteId = "campus";
/** The brand blue: what a fresh custom palette starts from. */
export const DEFAULT_CUSTOM_COLOR = "#0094FF";

export interface PaletteOption {
  id: PaletteId;
  label: string;
  description: string;
}

export const PALETTE_OPTIONS: readonly PaletteOption[] = [
  {
    id: "campus",
    label: "Campus",
    description: "Deep navy with the Campus Web blue and violet.",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Neutral graphite. Colour only where you act.",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    description: "Pure greyscale, for focus and low distraction.",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Pick any colour; the whole theme follows it.",
  },
];

/** Quick picks for the custom palette, spread around the hue wheel. */
export const CUSTOM_COLOR_SWATCHES = [
  "#0094FF",
  "#9747FF",
  "#00A887",
  "#E0457B",
  "#E07B00",
  "#2E9E4F",
  "#00A3C4",
  "#C2410C",
] as const;

/**
 * How a custom palette is derived from one colour's hue. Lightness is fixed
 * per role so contrast holds at every hue (checked across 0-330 deg: white
 * on the fill 4.7-5.7:1, accent text 7.7-9.1:1 on the canvas).
 */
export const CUSTOM_RECIPE = {
  /** Surface ladder: [lightness, chroma] - a faint tint of the hue. */
  surfaces: {
    "surface-lowest": [0.134, 0.01],
    surface: [0.158, 0.012],
    "surface-low": [0.19, 0.014],
    "surface-container": [0.216, 0.016],
    "surface-high": [0.246, 0.019],
    "surface-highest": [0.283, 0.023],
    "surface-bright": [0.323, 0.026],
  },
  text: {
    "on-surface": [0.95, 0.012],
    "on-surface-brand": [0.82, 0.07],
    "on-surface-muted": [0.74, 0.03],
    "on-surface-subtle": [0.55, 0.03],
    outline: [0.55, 0.025],
    "outline-variant": [0.3, 0.025],
  },
  /** Fill roles: [lightness, chroma]; chroma is capped by the picked colour. */
  primary: {
    fill: [0.54, 0.2],
    hover: [0.49, 0.19],
    accent: [0.74, 0.16],
    container: [0.27, 0.06],
    onContainer: [0.92, 0.04],
    ring: [0.72, 0.15],
  },
  /** Secondary sits this many degrees round the wheel from the primary. */
  secondaryHueOffset: 60,
} as const;

/** Cookie the theme choice lives in - readable by the pre-paint script. */
export const THEME_COOKIE = "cw-theme";
/** One year: a theme is a preference, not a session. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
