/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SERVE: process.env.NEXT_PUBLIC_SERVE,
    NEXT_PUBLIC_SERVE_1: process.env.NEXT_PUBLIC_SERVE_1,
    NEXT_PUBLIC_SERVE_2: process.env.NEXT_PUBLIC_SERVE_2,
    NEXT_PUBLIC_SERVE_3: process.env.NEXT_PUBLIC_SERVE_3,
    NEXT_PUBLIC_SERVE_4: process.env.NEXT_PUBLIC_SERVE_4,
    NEXT_PUBLIC_SERVE_5: process.env.NEXT_PUBLIC_SERVE_5,
    NEXT_PUBLIC_SERVE_6: process.env.NEXT_PUBLIC_SERVE_6,
    NEXT_PUBLIC_SERVE_7: process.env.NEXT_PUBLIC_SERVE_7,
    NEXT_PUBLIC_SERVE_8: process.env.NEXT_PUBLIC_SERVE_8,
    NEXT_PUBLIC_SERVE_9: process.env.NEXT_PUBLIC_SERVE_9,
  },
};

export default nextConfig;
