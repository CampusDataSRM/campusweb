"use client";

import dynamic from "next/dynamic";

import { useTheme } from "@/context/theme-context";
import { useCanRunEffects } from "@/hooks/use-device-capability";

// The interactive dot field is canvas + gsap: loaded only on capable devices,
// never in the server render.
const DotGrid = dynamic(() => import("@/components/DotGrid"), { ssr: false });

/**
 * The sign-in backdrop: a static dot pattern everywhere (pure CSS, palette
 * coloured), upgraded to the interactive reactbits DotGrid where the device
 * can afford it. Colours come from the active theme.
 */
export function SignInBackdrop() {
  const capable = useCanRunEffects();
  const { palette } = useTheme();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {capable ? (
        <div className="pointer-events-auto absolute inset-0 opacity-70">
          <DotGrid
            dotSize={3}
            gap={22}
            baseColor={palette["outline-variant"]}
            activeColor={palette["primary-accent"]}
            proximity={120}
            shockRadius={200}
            shockStrength={4}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(var(--outline-variant)_1.5px,transparent_1.5px)] [background-size:22px_22px] opacity-70" />
      )}
      {/* Fade the field into the canvas so text stays readable. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,var(--surface)_75%)]" />
    </div>
  );
}
