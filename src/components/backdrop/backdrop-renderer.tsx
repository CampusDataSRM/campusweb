"use client";

/**
 * Renders the active canvas-based backdrop effect, if any.
 *
 * When the user selects a backdrop other than "none" the CSS `body::before`
 * layer is hidden via a `data-backdrop-effect` attribute on <html> and this
 * component renders the matching WebGPU/WebGL canvas instead.
 *
 * Each component is lazy-loaded so the bundle cost is only paid when the
 * effect is actually chosen.
 */

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

import { useTheme } from "@/context/theme-context";

const ShapeWaves = dynamic(() => import("@/components/backdrop/ShapeWaves"), {
  ssr: false,
});
const AeroShards = dynamic(() => import("@/components/backdrop/aeroshards"), {
  ssr: false,
});
const Ferrofluid = dynamic(() => import("@/components/backdrop/ferro-fluid"), {
  ssr: false,
});
const GradientWaves = dynamic(
  () => import("@/components/backdrop/gradient-waves"),
  { ssr: false },
);
const MoltenMetal = dynamic(
  () => import("@/components/backdrop/molten-metal"),
  { ssr: false },
);

export function BackdropRenderer() {
  const { preference, backdropColors } = useTheme();
  // Only the campus-glow palette supports custom canvas backdrops
  const effectId = preference.palette === "campus-glow" ? preference.backdropEffect : "none";

  // Set/remove the data attribute that hides body::before when a canvas
  // backdrop is active.
  useEffect(() => {
    const root = document.documentElement;
    if (effectId !== "none") {
      root.setAttribute("data-backdrop-effect", effectId);
    } else {
      root.removeAttribute("data-backdrop-effect");
    }
    return () => root.removeAttribute("data-backdrop-effect");
  }, [effectId]);

  const backdrop = useMemo(() => {
    switch (effectId) {
      case "shape-waves":
        return (
          <ShapeWaves
            color={backdropColors.shapeWaves.color}
            hoverColor={backdropColors.shapeWaves.hoverColor}
            backgroundColor={backdropColors.shapeWaves.backgroundColor}
            speed={0.8}
            fade={0.25}
          />
        );
      case "aero-shards":
        return (
          <AeroShards
            backgroundColor={backdropColors.aeroShards.backgroundColor}
            shardColor={backdropColors.aeroShards.shardColor}
            accentColor={backdropColors.aeroShards.accentColor}
            speed={0.6}
            bloom={0.4}
          />
        );
      case "ferro-fluid":
        return (
          <Ferrofluid
            colors={backdropColors.ferroFluid.colors}
            speed={0.4}
            opacity={0.85}
          />
        );
      case "gradient-waves":
        return (
          <GradientWaves
            horizonColor={backdropColors.gradientWaves.horizonColor}
            waveColor={backdropColors.gradientWaves.waveColor}
            crestColor={backdropColors.gradientWaves.crestColor}
            speed={0.6}
            opacity={0.9}
          />
        );
      case "molten-metal":
        return (
          <MoltenMetal
            color1={backdropColors.moltenMetal.color1}
            color2={backdropColors.moltenMetal.color2}
            color3={backdropColors.moltenMetal.color3}
            backgroundColor={backdropColors.moltenMetal.backgroundColor}
            speed={0.5}
            opacity={0.85}
          />
        );
      default:
        return null;
    }
  }, [effectId, backdropColors]);

  if (!backdrop) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {backdrop}
    </div>
  );
}
