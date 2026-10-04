/**
 * The theme: every colour the app uses, and nothing else may define one.
 *
 * The presets are Campus App's own (lib/themes/campus_theme.dart) - Campus
 * Glow is the default, the original Campus Web look - so the website and the
 * app are recognisably the same product. Values are the app's, mapped onto
 * semantic roles:
 * - `surface` is the canvas behind the backdrop; cards sit on it as the
 *   app's translucent "pseudo-glass" (`surface-container`), sheets and menus
 *   on an opaque `surface-modal`;
 * - fills that carry white text are darkened toward black until white reads
 *   at 4.5:1 - the app's own `deepenForWhite` rule - so buttons stay readable independently of their lighter accent.
 *
 * Components never name a colour; they use semantic utilities
 * (`bg-surface-container`, `text-on-surface-muted`, `bg-cta`...).
 */

export const THEME_TOKENS = [
  "surface-lowest",
  "surface",
  "surface-low",
  "surface-container",
  "surface-high",
  "surface-highest",
  "surface-bright",
  "surface-modal",
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

/** Per-palette paint that isn't a single colour. */
export interface PaletteExtras {
  /** The full-page backdrop (the app's background asset / gradient). */
  backdrop: string;
  /** Primary call-to-action fill - Campus Glow's solid campus blue. */
  cta: string;
}

/** Campus Glow - the original Campus Web look, and the default. */
const CAMPUS_GLOW: ThemePalette = {
  "surface-lowest": "#000000",
  surface: "#000000",
  "surface-low": "rgb(12 77 162 / 0.2)",
  "surface-container": "rgb(12 77 162 / 0.2)",
  "surface-high": "rgb(21 101 192 / 0.22)",
  "surface-highest": "rgb(255 255 255 / 0.1)",
  "surface-bright": "rgb(255 255 255 / 0.16)",
  "surface-modal": "#0D1F3C",
  "on-surface": "#EEF5FF",
  "on-surface-brand": "#91C3E7",
  "on-surface-muted": "rgb(255 255 255 / 0.71)",
  "on-surface-subtle": "rgb(255 255 255 / 0.47)",
  outline: "rgb(255 255 255 / 0.24)",
  "outline-variant": "rgb(255 255 255 / 0.1)",
  primary: "#007BBA",
  "on-primary": "#FFFFFF",
  "primary-hover": "#006BA3",
  "primary-accent": "#0094FF",
  "primary-container": "rgb(0 148 255 / 0.16)",
  "on-primary-container": "#BDEBFF",
  secondary: "#7C4DFF",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#B39DFF",
  "secondary-container": "rgb(124 77 255 / 0.2)",
  "on-secondary-container": "#E3D9FF",
  success: "#00871E",
  "on-success": "#FFFFFF",
  "success-accent": "#00FF38",
  "success-container": "rgb(0 255 56 / 0.12)",
  "on-success-container": "#B8FFC8",
  warning: "#FFB800",
  "on-warning": "#1A1200",
  "warning-accent": "#FFB800",
  "warning-container": "rgb(255 184 0 / 0.14)",
  "on-warning-container": "#FFE7A3",
  danger: "#D63939",
  "on-danger": "#FFFFFF",
  "danger-accent": "#FF4444",
  "danger-container": "rgb(255 68 68 / 0.14)",
  "on-danger-container": "#FFC9C9",
  ring: "#00E5FF",
  "chart-1": "#0094FF",
  "chart-2": "#7C4DFF",
  "chart-3": "#00E5FF",
  "chart-4": "#FFB800",
  "chart-5": "#FF4444",
};

/** Dark - clean neutral black and charcoal. */
const DARK: ThemePalette = {
  "surface-lowest": "#050506",
  surface: "#09090B",
  "surface-low": "#111113",
  "surface-container": "#18181B",
  "surface-high": "#202024",
  "surface-highest": "#27272A",
  "surface-bright": "#3F3F46",
  "surface-modal": "#18181B",
  "on-surface": "#FAFAFA",
  "on-surface-brand": "#E4E4E7",
  "on-surface-muted": "#D4D4D8",
  "on-surface-subtle": "#A1A1AA",
  outline: "#71717A",
  "outline-variant": "#3F3F46",
  primary: "#52525B",
  "on-primary": "#FFFFFF",
  "primary-hover": "#3F3F46",
  "primary-accent": "#E4E4E7",
  "primary-container": "#27272A",
  "on-primary-container": "#FAFAFA",
  secondary: "#71717A",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#D4D4D8",
  "secondary-container": "#27272A",
  "on-secondary-container": "#FAFAFA",
  success: "#15803D",
  "on-success": "#FFFFFF",
  "success-accent": "#4ADE80",
  "success-container": "#0F2A1C",
  "on-success-container": "#BBF7D0",
  warning: "#FACC15",
  "on-warning": "#1A1200",
  "warning-accent": "#FACC15",
  "warning-container": "#2E2106",
  "on-warning-container": "#FDE68A",
  danger: "#DC2626",
  "on-danger": "#FFFFFF",
  "danger-accent": "#F87171",
  "danger-container": "#3B1214",
  "on-danger-container": "#FECACA",
  ring: "#E4E4E7",
  "chart-1": "#E4E4E7",
  "chart-2": "#A1A1AA",
  "chart-3": "#4ADE80",
  "chart-4": "#FACC15",
  "chart-5": "#F87171",
};

/** Monochrome - quiet, focused black and white (as the app: no hue at all). */
const MONOCHROME: ThemePalette = {
  "surface-lowest": "#000000",
  surface: "#000000",
  "surface-low": "rgb(255 255 255 / 0.07)",
  "surface-container": "rgb(255 255 255 / 0.05)",
  "surface-high": "rgb(255 255 255 / 0.09)",
  "surface-highest": "rgb(255 255 255 / 0.12)",
  "surface-bright": "rgb(255 255 255 / 0.18)",
  "surface-modal": "#151515",
  "on-surface": "#FFFFFF",
  "on-surface-brand": "#FFFFFF",
  "on-surface-muted": "rgb(255 255 255 / 0.8)",
  "on-surface-subtle": "rgb(255 255 255 / 0.57)",
  outline: "rgb(255 255 255 / 0.38)",
  "outline-variant": "rgb(255 255 255 / 0.12)",
  primary: "#666666",
  "on-primary": "#FFFFFF",
  "primary-hover": "#555555",
  "primary-accent": "#FFFFFF",
  "primary-container": "rgb(255 255 255 / 0.12)",
  "on-primary-container": "#FFFFFF",
  secondary: "#555555",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#D6D6D6",
  "secondary-container": "rgb(255 255 255 / 0.1)",
  "on-secondary-container": "#FFFFFF",
  success: "#666666",
  "on-success": "#FFFFFF",
  "success-accent": "#FFFFFF",
  "success-container": "rgb(255 255 255 / 0.1)",
  "on-success-container": "#FFFFFF",
  warning: "#D6D6D6",
  "on-warning": "#000000",
  "warning-accent": "#D6D6D6",
  "warning-container": "rgb(255 255 255 / 0.1)",
  "on-warning-container": "#FFFFFF",
  danger: "#666666",
  "on-danger": "#FFFFFF",
  "danger-accent": "#FFFFFF",
  "danger-container": "rgb(255 255 255 / 0.14)",
  "on-danger-container": "#FFFFFF",
  ring: "#FFFFFF",
  "chart-1": "#FFFFFF",
  "chart-2": "#969696",
  "chart-3": "#D6D6D6",
  "chart-4": "#666666",
  "chart-5": "#B4B4B4",
};

/** High Contrast - sharper edges and brighter text. */
const HIGH_CONTRAST: ThemePalette = {
  "surface-lowest": "#000000",
  surface: "#000000",
  "surface-low": "#0A2348",
  "surface-container": "#0A1933",
  "surface-high": "#102348",
  "surface-highest": "#16305C",
  "surface-bright": "#1E3D70",
  "surface-modal": "#0A1933",
  "on-surface": "#FFFFFF",
  "on-surface-brand": "#8BE9FF",
  "on-surface-muted": "#E6F0FF",
  "on-surface-subtle": "#B6C7E2",
  outline: "#77A8D8",
  "outline-variant": "#2C4A75",
  primary: "#0077B6",
  "on-primary": "#FFFFFF",
  "primary-hover": "#00639A",
  "primary-accent": "#8BE9FF",
  "primary-container": "#0B3B68",
  "on-primary-container": "#FFFFFF",
  secondary: "#6846C7",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#C9B7FF",
  "secondary-container": "#28205E",
  "on-secondary-container": "#FFFFFF",
  success: "#0F7A3A",
  "on-success": "#FFFFFF",
  "success-accent": "#72FF9B",
  "success-container": "#0D2E1C",
  "on-success-container": "#D4FFE0",
  warning: "#FFD75A",
  "on-warning": "#1A1200",
  "warning-accent": "#FFD75A",
  "warning-container": "#33290A",
  "on-warning-container": "#FFF1C2",
  danger: "#C52C3C",
  "on-danger": "#FFFFFF",
  "danger-accent": "#FF7483",
  "danger-container": "#3A1218",
  "on-danger-container": "#FFE0E4",
  ring: "#8BE9FF",
  "chart-1": "#8BE9FF",
  "chart-2": "#C9B7FF",
  "chart-3": "#72FF9B",
  "chart-4": "#FFD75A",
  "chart-5": "#FF7483",
};

/** Midnight - a calmer, blue-only palette. */
const MIDNIGHT: ThemePalette = {
  "surface-lowest": "#000308",
  surface: "#01050D",
  "surface-low": "#081A3A",
  "surface-container": "#08152C",
  "surface-high": "#0D1D3B",
  "surface-highest": "#13284D",
  "surface-bright": "#1A335E",
  "surface-modal": "#0A1A35",
  "on-surface": "#F5F8FF",
  "on-surface-brand": "#7CCFFF",
  "on-surface-muted": "#C1CDE0",
  "on-surface-subtle": "#7F8DA5",
  outline: "#4A6A99",
  "outline-variant": "#314A71",
  primary: "#3877BA",
  "on-primary": "#FFFFFF",
  "primary-hover": "#2F67A3",
  "primary-accent": "#4DA3FF",
  "primary-container": "#103B68",
  "on-primary-container": "#D6EAFF",
  secondary: "#5E6EC4",
  "on-secondary": "#FFFFFF",
  "secondary-accent": "#7386EF",
  "secondary-container": "#1C275B",
  "on-secondary-container": "#DDE2FF",
  success: "#1D7A51",
  "on-success": "#FFFFFF",
  "success-accent": "#55DDA0",
  "success-container": "#0B2A20",
  "on-success-container": "#C7F5DF",
  warning: "#E7B85A",
  "on-warning": "#1A1200",
  "warning-accent": "#E7B85A",
  "warning-container": "#2E2410",
  "on-warning-container": "#F7E2B5",
  danger: "#C9404D",
  "on-danger": "#FFFFFF",
  "danger-accent": "#FF6B78",
  "danger-container": "#3A1419",
  "on-danger-container": "#FFD4D8",
  ring: "#7CCFFF",
  "chart-1": "#4DA3FF",
  "chart-2": "#7386EF",
  "chart-3": "#55DDA0",
  "chart-4": "#E7B85A",
  "chart-5": "#FF6B78",
};

export const PRESET_PALETTES = {
  "campus-glow": CAMPUS_GLOW,
  dark: DARK,
  monochrome: MONOCHROME,
  "high-contrast": HIGH_CONTRAST,
  midnight: MIDNIGHT,
} as const;

export type PresetPaletteId = keyof typeof PRESET_PALETTES;
export type PaletteId = PresetPaletteId | "custom";

/** Backdrop and call-to-action paint per preset (the app's background + gradients). */
export const PRESET_EXTRAS: Record<PresetPaletteId, PaletteExtras> = {
  "campus-glow": {
    // Original Figma background vectors, anchored to the right edge.
    // The mobile design uses x=-141.3 at a 390px viewport.
    backdrop:
      "url('/themes/campus-glow/backdrop.svg') right -556px top -345px / 1087.3px 2570.31px no-repeat, " +
      "url('/themes/campus-glow/glow.svg') right -556px top -345px / 1087.3px 1285.31px no-repeat, " +
      "url('/themes/campus-glow/glow.svg') right -556px top 940px / 1087.3px 1285.31px no-repeat, #000000",
    cta: "#007BBA",
  },
  dark: {
    backdrop: "linear-gradient(135deg, #09090B 0%, #0C0C0E 50%, #111113 100%)",
    cta: "#52525B",
  },
  monochrome: {
    backdrop: "linear-gradient(135deg, #000000 0%, #090909 50%, #161616 100%)",
    cta: "#666666",
  },
  "high-contrast": {
    backdrop: "linear-gradient(135deg, #000000 0%, #06152A 50%, #111B43 100%)",
    cta: "#0077B6",
  },
  midnight: {
    backdrop: "linear-gradient(135deg, #01050D 0%, #07142A 50%, #111B41 100%)",
    cta: "#3877BA",
  },
};

/** A custom palette's backdrop and CTA, built from its own variables. */
export const CUSTOM_EXTRAS: PaletteExtras = {
  backdrop:
    "radial-gradient(55% 45% at 100% 0%, color-mix(in oklab, var(--secondary) 45%, transparent) 0%, transparent 70%), " +
    "radial-gradient(70% 40% at 0% 100%, color-mix(in oklab, var(--primary) 45%, transparent) 0%, transparent 70%), var(--surface)",
  cta: "var(--primary)",
};

export const DEFAULT_PALETTE: PaletteId = "campus-glow";
/** The app's default custom accent. */
export const DEFAULT_CUSTOM_COLOR = "#00A8FF";

export interface PaletteOption {
  id: PaletteId;
  label: string;
  description: string;
}

/** Names and descriptions as in Campus App's appearance settings. */
export const PALETTE_OPTIONS: readonly PaletteOption[] = [
  {
    id: "campus-glow",
    label: "Campus Glow",
    description: "The original Campus Web look",
  },
  {
    id: "dark",
    label: "Dark",
    description: "Clean neutral black and charcoal",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    description: "Quiet, focused black and white",
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    description: "Sharper edges and brighter text",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "A calmer blue-only palette",
  },
  {
    id: "custom",
    label: "Custom accent",
    description: "Your chosen accent on the Campus UI",
  },
];

/** Campus App's accent swatches. */
export const CUSTOM_COLOR_SWATCHES = [
  "#00A8FF",
  "#008F83",
  "#7554E8",
  "#C73D86",
  "#B86A00",
  "#248B4B",
] as const;

/**
 * The surfaces a custom palette starts from (all hex, so a custom palette
 * can be stored compactly): a dark base the accent then tints.
 */
export const CUSTOM_BASE: ThemePalette = {
  ...DARK,
  ...{
    success: "#15803D",
    "success-accent": "#55E79A",
    warning: "#FFC857",
    "warning-accent": "#FFC857",
    danger: "#D63939",
    "danger-accent": "#FF6678",
  },
};

/**
 * How a custom palette is derived from one colour's hue. Lightness is fixed
 * per role so contrast holds at every hue (checked across 0-330 deg).
 */
export const CUSTOM_RECIPE = {
  surfaces: {
    "surface-lowest": [0.134, 0.01],
    surface: [0.158, 0.012],
    "surface-low": [0.19, 0.014],
    "surface-container": [0.216, 0.016],
    "surface-high": [0.246, 0.019],
    "surface-highest": [0.283, 0.023],
    "surface-bright": [0.323, 0.026],
    "surface-modal": [0.216, 0.02],
  },
  text: {
    "on-surface": [0.95, 0.012],
    "on-surface-brand": [0.82, 0.07],
    "on-surface-muted": [0.74, 0.03],
    "on-surface-subtle": [0.55, 0.03],
    outline: [0.55, 0.025],
    "outline-variant": [0.3, 0.025],
  },
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
