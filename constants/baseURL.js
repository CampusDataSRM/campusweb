const servers = [
  process.env.NEXT_PUBLIC_SERVE_1,
  process.env.NEXT_PUBLIC_SERVE_2,
  process.env.NEXT_PUBLIC_SERVE_3
];

export const baseURL = servers[Math.floor(Math.random() * servers.length)];
