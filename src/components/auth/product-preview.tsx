"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * The sign-in page's centrepiece: three real pieces of the dashboard,
 * layered in depth, that lean toward the cursor. It shows what you get
 * instead of describing it.
 *
 * Cheap by construction: CSS 3D transforms driven by two custom properties
 * (one style write per frame, mouse/trackpad only), an SVG ring instead of a
 * chart library, and idle float/countdown motion that the global
 * reduced-motion rule freezes.
 */

const PERIOD_SECONDS = 50 * 60;

function Countdown() {
  // A period that's already 37 minutes in; ticks down live.
  const [left, setLeft] = useState(13 * 60 + 9);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setLeft((s) => (s <= 60 ? 13 * 60 + 9 : s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);
  const done = (PERIOD_SECONDS - left) / PERIOD_SECONDS;
  return (
    <>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-highest">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,var(--success),var(--success-accent))] shadow-[0_0_12px_var(--success-accent)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${done * 100}%` }}
        />
      </div>
      <span className="w-[5.5rem] shrink-0 text-right text-sm font-extrabold text-on-surface tabular">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left
      </span>
    </>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 100 100" className="size-full -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-surface-highest" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        className="preview-ring stroke-success-accent"
        style={{ strokeDasharray: c, strokeDashoffset: c * (1 - percent / 100), ["--ring-c" as string]: c }}
      />
    </svg>
  );
}

const card = "panel preview-card absolute rounded-[1.5rem] [backface-visibility:hidden]";

export function ProductPreview({ className }: { className?: string }) {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scene.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.setProperty("--ry", `${x * 14}deg`);
      el.style.setProperty("--rx", `${-y * 10}deg`);
    };
    const onMove = (event: PointerEvent) => {
      // Lean toward the cursor anywhere on the page, strongest near the scene.
      x = Math.max(-1, Math.min(1, (event.clientX / window.innerWidth) * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY / window.innerHeight) * 2 - 1));
      if (!frame) frame = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={scene} aria-hidden className={cn("preview-scene relative h-[24rem] w-[34rem] shrink-0 [perspective:1400px]", className)}>
      <div className="preview-stage absolute inset-0 [transform-style:preserve-3d]">
        {/* The light behind it all. */}
        <div className="absolute top-1/2 left-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--secondary)_55%,transparent),transparent)] blur-2xl [transform:translateZ(-120px)]" />

        {/* Back: overall attendance. */}
        <div className={cn(card, "top-0 right-0 w-52 p-5 [transform:translateZ(-60px)]")}>
          <div className="preview-float flex flex-col items-center gap-3 [animation-delay:-2s]">
            <div className="relative size-28">
              <span className="absolute inset-[14%] rounded-full bg-success-accent opacity-30 blur-xl" />
              <Ring percent={82.7} />
              <span className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-success-accent tabular">82.7%</span>
                <span className="text-[0.625rem] font-bold text-on-surface-muted">overall</span>
              </span>
            </div>
            <span className="text-sm font-extrabold text-on-surface">You&apos;re above 75%</span>
          </div>
        </div>

        {/* Middle: can I skip? */}
        <div className={cn(card, "top-6 left-0 w-72 p-4 [transform:translateZ(0px)]")}>
          <div className="preview-float flex flex-col gap-3 [animation-delay:-4s]">
            <span className="text-sm font-extrabold text-on-surface">Can I skip?</span>
            {[
              { name: "Operating Systems", pct: 71, verdict: "Attend 6", tone: "risk" as const },
              { name: "Compiler Design", pct: 90, verdict: "Skip 8", tone: "safe" as const },
            ].map((row) => (
              <div key={row.name} className="flex flex-col gap-2 rounded-xl bg-surface-high px-3 py-2.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.8125rem] font-bold text-on-surface">{row.name}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.6875rem] font-extrabold", row.tone === "risk" ? "bg-danger-container text-on-danger-container" : "bg-secondary-container text-on-secondary-container")}>
                    {row.verdict}
                  </span>
                </span>
                <span className="relative h-1.5 rounded-full bg-surface-highest">
                  <span className={cn("absolute inset-y-0 left-0 rounded-full", row.tone === "risk" ? "bg-danger-accent" : "bg-success-accent")} style={{ width: `${row.pct}%` }} />
                  <span className="absolute -top-1 left-[75%] h-3.5 w-0.5 rounded-full bg-on-surface" />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Front: the class on now. */}
        <div className={cn(card, "panel-raised right-8 bottom-0 w-[22rem] p-5 [transform:translateZ(80px)]")}>
          <div className="preview-float flex flex-col gap-3">
            <span className="flex items-center gap-2 text-xs font-extrabold text-primary-accent">
              <span className="live-dot text-success-accent" /> On now, until 11:30 AM
            </span>
            <span className="text-2xl leading-tight font-black text-on-surface">Compiler Design</span>
            <span className="text-sm font-semibold text-on-surface-muted">Room TP 1201. Then Data Mining at 11:35 AM</span>
            <span className="flex items-center gap-3">
              <Countdown />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
