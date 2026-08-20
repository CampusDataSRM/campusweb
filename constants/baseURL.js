const servers = [
  process.env.NEXT_PUBLIC_SERVE_1,
  process.env.NEXT_PUBLIC_SERVE_2,
  process.env.NEXT_PUBLIC_SERVE_3,
];

export const baseURL = process.env.NEXT_PUBLIC_SERVE_2 || process.env.NEXT_PUBLIC_SERVER;
