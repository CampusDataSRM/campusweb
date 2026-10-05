"use client";

import { useState, useRef, type ReactNode, type TouchEvent } from "react";
import { cn } from "@/lib/utils";

export interface StackedSliderProps {
  items: { label: string; content: ReactNode }[];
  className?: string;
  clickToSwap?: boolean;
}

export function StackedSlider({ items, className, clickToSwap = false }: StackedSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  const next = () => setActiveIndex((prev) => (prev + 1) % items.length);
  const prev = () => setActiveIndex((p) => (p - 1 + items.length) % items.length);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (diff > 50) prev();
    else if (diff < -50) next();
    touchStart.current = null;
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div className="flex flex-row flex-nowrap items-center p-1 bg-surface-highest/40 backdrop-blur-md rounded-full w-full border border-outline-variant/30 shadow-inner">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(index);
            }}
            className={cn(
              "flex-1 w-full py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap",
              activeIndex === index
                ? "bg-primary text-on-primary shadow-md"
                : "text-on-surface-muted hover:text-on-surface hover:bg-surface-bright/50"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className={cn("grid w-full touch-pan-y", clickToSwap && "cursor-pointer")}
      onClick={clickToSwap ? next : undefined}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {items.map((item, index) => {
        const offset = (index - activeIndex + items.length) % items.length;

        // Active item is offset 0.
        // Item behind is offset 1, etc.
        const isActive = offset === 0;

        return (
          <div
            key={index}
            className={cn(
              "transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
              !isActive && "pointer-events-none select-none",
            )}
            style={{
              gridArea: "1 / 1",
              zIndex: items.length - offset,
              // Move right by 16px per offset so the right border is visible,
              // and scale down vertically to create a paper stack effect.
              transform: `translateX(${offset * 16}px) scaleY(${1 - offset * 0.05})`,
              transformOrigin: "center left",
              opacity: isActive ? 1 : Math.max(0, 1 - offset * 0.2),
            }}
            aria-hidden={!isActive}
          >
            {item.content}
          </div>
        );
      })}
      </div>
      
    </div>
  );
}
