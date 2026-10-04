"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Small dot after the label, e.g. "today". */
  marker?: boolean;
}

/**
 * A single-choice switch whose highlight slides to the picked option (a
 * shared-layout spring). Radio semantics, arrow keys move the choice.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  size = "md",
  stretch = false,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
  /** Fill the width, options equal. */
  stretch?: boolean;
}) {
  const id = useId();
  const index = options.findIndex((o) => o.value === value);

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => {
        const step =
          event.key === "ArrowRight" || event.key === "ArrowDown"
            ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowUp"
              ? -1
              : 0;
        if (!step) return;
        event.preventDefault();
        const next = options[(index + step + options.length) % options.length];
        onChange(next.value);
        event.currentTarget
          .querySelector<HTMLElement>(`[data-value="${next.value}"]`)
          ?.focus();
      }}
      className={cn(
        "relative flex max-w-full gap-1 overflow-x-auto rounded-lg border border-outline-variant bg-surface-container p-1 [scrollbar-width:none]",
        stretch ? "w-full" : "w-fit",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-value={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative isolate flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-bold whitespace-nowrap transition-colors duration-(--duration-short)",
              size === "sm"
                ? "h-8 px-3.5 text-[0.8125rem]"
                : "h-10 px-4 text-sm",
              // Stretched: options share the width and may shrink, so five
              // fit on a phone without scrolling.
              stretch && "min-w-0 flex-1 shrink px-1.5",
              selected
                ? "text-on-primary-container"
                : "text-on-surface-muted hover:text-on-surface",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segmented-${id}`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-lg bg-primary-container"
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            )}
            {option.label}
            {option.marker && (
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-lg",
                  selected ? "bg-on-primary-container" : "bg-success-accent",
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
