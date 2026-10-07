/**
 * Colour maths for the theme system: sRGB hex <-> OKLCH, gamut mapping, and
 * WCAG contrast.
 *
 * OKLCH is perceptually uniform: holding lightness (L) fixed while changing hue
 * keeps text contrast close to constant, which is what lets a user-picked
 * colour become a whole palette without a single pair failing contrast. CSS
 * `oklch()` alone would let the browser clip out-of-gamut colours, which
 * shifts their lightness - so roles are resolved here, to in-gamut hex, by
 * reducing chroma until the colour fits sRGB.
 *
 * Pure functions, no DOM: safe on the server and in the pre-paint script's
 * generator.
 */

export interface Oklch {
  /** Lightness, 0..1. */
  l: number;
  /** Chroma, 0..~0.37. */
  c: number;
  /** Hue in degrees, 0..360. */
  h: number;
}

type Rgb = [number, number, number];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/* ── sRGB transfer ── */

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const fromLinear = (channel: number) =>
  channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * channel ** (1 / 2.4) - 0.055;

/* ── hex ── */

export function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : match[1];
  const value = Number.parseInt(digits, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
    (channel) => channel / 255,
  ) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  const byte = (channel: number) =>
    Math.round(clamp01(channel) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`.toUpperCase();
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && hexToRgb(value) !== null;
}

/* ── OKLab / OKLCH (Björn Ottosson's reference matrices) ── */

function linearRgbToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinearRgb([L, a, b]: Rgb): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [L, a, b] = linearRgbToOklab(rgb.map(toLinear) as Rgb);
  const c = Math.hypot(a, b);
  const h = c < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const radians = (h * Math.PI) / 180;
  return oklabToLinearRgb([l, c * Math.cos(radians), c * Math.sin(radians)]);
}

const inGamut = (rgb: Rgb) =>
  rgb.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4);

/**
 * OKLCH -> in-gamut sRGB hex. Lightness and hue are preserved; chroma is
 * reduced by binary search until the colour fits (CSS Color 4 gamut mapping,
 * simplified). 20 iterations resolve chroma to ~4e-7.
 */
export function oklchToHex(color: Oklch): string {
  let linear = oklchToLinearRgb(color);
  if (!inGamut(linear)) {
    let low = 0;
    let high = color.c;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      if (inGamut(oklchToLinearRgb({ ...color, c: mid }))) low = mid;
      else high = mid;
    }
    linear = oklchToLinearRgb({ ...color, c: low });
  }
  return rgbToHex(linear.map((channel) => fromLinear(clamp01(channel))) as Rgb);
}

/* ── WCAG 2.x contrast ── */

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `#RRGGBB` + alpha 0..1 -> `rgb(r g b / a)` for scrims and translucent fills. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb.map((channel) => Math.round(channel * 255));
  return `rgb(${r} ${g} ${b} / ${clamp01(alpha)})`;
}
