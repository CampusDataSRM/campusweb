import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Preview builds only (e.g. a tunnel link for the team): the browser calls
  // this site at /api-proxy and Next forwards to the real API server-side,
  // so the API's CORS allow-list doesn't have to include the preview origin.
  // Inert unless API_PROXY_TARGET is set at build time.
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    return target ? [{ source: "/api-proxy/:path*", destination: `${target}/:path*` }] : [];
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
