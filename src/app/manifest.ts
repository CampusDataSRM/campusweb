import type { MetadataRoute } from "next";

import { STUDENT_ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { DEFAULT_PALETTE, PRESET_PALETTES } from "@/constants/theme";

const surface =
  DEFAULT_PALETTE === "custom"
    ? PRESET_PALETTES["campus-glow"].surface
    : PRESET_PALETTES[DEFAULT_PALETTE].surface;

const icon = (size: number) => ({
  src: `/manifest/icon-${size}x${size}.png`,
  sizes: `${size}x${size}`,
  type: "image/png",
});

/**
 * The web app manifest (served at /manifest.webmanifest and linked by Next).
 * Opens on the student home - the proxy sends anyone signed out to sign-in -
 * with shortcuts to the pages students open most.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: STUDENT_ROUTES.dashboard,
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: surface,
    categories: ["education", "productivity"],
    icons: [
      ...[72, 96, 128, 144, 152, 192, 384, 512].map(icon),
      {
        src: "/manifest/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/manifest/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Attendance", url: STUDENT_ROUTES.attendance },
      { name: "Timetable", url: STUDENT_ROUTES.timetable },
      { name: "Marks", url: STUDENT_ROUTES.marks },
      { name: "Notes", url: STUDENT_ROUTES.notes },
    ].map((shortcut) => ({ ...shortcut, icons: [icon(96)] })),
  };
}
