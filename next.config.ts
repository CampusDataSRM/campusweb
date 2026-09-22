import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      // Same-origin proxy: the frontend only ever calls /api/*; requests are
      // forwarded to the real API origin server-side (no CORS exposure).
      // Array form runs AFTER filesystem routes, so the existing /api/health
      // route handler keeps working.
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_SERVE ?? ""}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        // Required later by the service worker (public/sw.js) to control the
        // whole origin and to never be cached.
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
