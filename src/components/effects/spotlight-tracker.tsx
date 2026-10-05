"use client";

import { useEffect } from "react";

/**
 * Feeds the cursor position to whichever `.spotlight` card is under it, as
 * --mx/--my. One document listener for the whole app, at most one style
 * write per frame, and only for a mouse or trackpad - touch never pays.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      const event = last;
      if (!event) return;
      const card = (event.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    const onMove = (event: PointerEvent) => {
      last = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
