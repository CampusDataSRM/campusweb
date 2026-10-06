import type { NextConfig } from "next";
const config: NextConfig = {
  async redirects() {
    return [
      { source: "/student/:path*", destination: "/", permanent: false },
      { source: "/club/:path*", destination: "/", permanent: false },
      { source: "/payment", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/app",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};
export default config;
