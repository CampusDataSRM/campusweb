"use client";

import { Check, Palette, RotateCcw } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CUSTOM_COLOR_SWATCHES,
  PALETTE_OPTIONS,
  CUSTOM_EXTRAS,
  PRESET_EXTRAS,
  PRESET_PALETTES,
  type PaletteId,
  type ThemePalette,
} from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { deriveCustomPalette } from "@/lib/theme/build-theme";
import { isHexColor } from "@/lib/theme/color";
import { cn } from "@/lib/utils";

/**
 * A miniature of a palette: canvas, a card, text lines and a primary
 * button - drawn with that palette's own values, so each option previews
 * itself regardless of the active theme.
 */
function PalettePreview({
  palette,
  backdrop,
}: {
  palette: ThemePalette;
  backdrop: string;
}) {
  // A custom backdrop refers to its palette's variables; resolve them here,
  // since the preview is not inside that palette.
  const paint = backdrop
    .replaceAll("var(--surface)", palette.surface)
    .replaceAll("var(--primary)", palette.primary)
    .replaceAll("var(--secondary)", palette.secondary);
  return (
    <div
      aria-hidden
      className="flex h-20 gap-1.5 rounded-xl p-2"
      style={{
        background: paint,
        border: `1px solid ${palette["outline-variant"]}`,
      }}
    >
      <div
        className="w-1/4 rounded-md"
        style={{ background: palette["surface-low"] }}
      />
      <div
        className="flex flex-1 flex-col gap-1.5 rounded-md p-1.5"
        style={{ background: palette["surface-container"] }}
      >
        <div
          className="h-1.5 w-3/4 rounded-full"
          style={{ background: palette["on-surface"] }}
        />
        <div
          className="h-1.5 w-1/2 rounded-full"
          style={{ background: palette["on-surface-muted"] }}
        />
        <div className="mt-auto flex gap-1">
          <div
            className="h-3 w-8 rounded-sm"
            style={{ background: palette["primary-accent"] }}
          />
          <div
            className="h-3 w-5 rounded-sm"
            style={{ background: palette["secondary-accent"] }}
          />
        </div>
      </div>
    </div>
  );
}

const previewFor = (id: PaletteId, customColor: string): ThemePalette =>
  id === "custom" ? deriveCustomPalette(customColor) : PRESET_PALETTES[id];

/** Palette choice and the custom colour - applied live, saved on this device. */
export function ThemePicker() {
  const id = useId();
  const { preference, hydrated, setPalette, setCustomColor, reset } =
    useTheme();
  // A draft only while typing; otherwise the field shows the saved colour.
  const [draft, setDraft] = useState<string | null>(null);
  const hex = draft ?? preference.customColor;

  return (
    <div className="flex flex-col gap-5" aria-busy={!hydrated}>
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        onKeyDown={(event) => {
          const direction =
            event.key === "ArrowRight" || event.key === "ArrowDown"
              ? 1
              : event.key === "ArrowLeft" || event.key === "ArrowUp"
                ? -1
                : 0;
          if (!direction && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const current = PALETTE_OPTIONS.findIndex(
            (option) => option.id === preference.palette,
          );
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? PALETTE_OPTIONS.length - 1
                : (current + direction + PALETTE_OPTIONS.length) %
                  PALETTE_OPTIONS.length;
          setPalette(PALETTE_OPTIONS[next].id);
          event.currentTarget
            .querySelectorAll<HTMLButtonElement>('[role="radio"]')
            [next]?.focus();
        }}
      >
        {PALETTE_OPTIONS.map((option) => {
          const selected = hydrated && preference.palette === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setPalette(option.id)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-3 text-left transition-colors",
                selected
                  ? "border-primary bg-primary-container/50"
                  : "border-outline-variant bg-surface-container hover:border-outline",
              )}
            >
              <PalettePreview
                palette={previewFor(option.id, preference.customColor)}
                backdrop={
                  option.id === "custom"
                    ? CUSTOM_EXTRAS.backdrop
                    : PRESET_EXTRAS[option.id].backdrop
                }
              />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-on-surface">{option.label}</p>
                  <p className="text-xs text-on-surface-muted">
                    {option.description}
                  </p>
                </div>
                {selected && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check aria-hidden className="size-4" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl panel p-4">
        <div className="flex items-center gap-2">
          <Palette aria-hidden className="size-5 text-primary-accent" />
          <p className="font-bold text-on-surface">Custom colour</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CUSTOM_COLOR_SWATCHES.map((swatch) => {
            const active =
              preference.palette === "custom" &&
              preference.customColor.toUpperCase() === swatch.toUpperCase();
            return (
              <button
                key={swatch}
                type="button"
                onClick={() => setCustomColor(swatch)}
                aria-label={`Use ${swatch}`}
                aria-pressed={active}
                className={cn(
                  "size-11 rounded-full border-2 transition-transform hover:scale-110",
                  active ? "border-on-surface" : "border-transparent",
                )}
                style={{ background: swatch }}
              />
            );
          })}
          <div className="flex items-center gap-2">
            <Label htmlFor={`${id}-color`} className="sr-only">
              Pick any colour
            </Label>
            <input
              id={`${id}-color`}
              type="color"
              value={isHexColor(hex) ? hex : preference.customColor}
              onChange={(event) => setCustomColor(event.target.value)}
              className="size-11 cursor-pointer rounded-full border border-outline bg-transparent p-0.5"
            />
            <Label htmlFor={`${id}-hex`} className="sr-only">
              Hex colour
            </Label>
            <Input
              id={`${id}-hex`}
              value={hex}
              onChange={(event) => {
                setDraft(event.target.value);
                if (
                  isHexColor(event.target.value) &&
                  event.target.value.length >= 7
                )
                  setCustomColor(event.target.value);
              }}
              onBlur={() => setDraft(null)}
              spellCheck={false}
              className="h-9 w-28 rounded-lg bg-surface-high font-mono uppercase"
            />
          </div>
        </div>
        <p className="text-xs text-on-surface-muted">
          Use a preset or choose an accent. Your preference is saved on this
          device.
        </p>
      </div>

      <Button variant="ghost" size="touch" className="w-fit" onClick={reset}>
        <RotateCcw aria-hidden /> Restore Campus Glow
      </Button>
    </div>
  );
}
