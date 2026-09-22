"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/api/query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Lazily resolves the query client: browser singleton or per-request
  // instance on the server (see src/lib/api/query-client.ts).
  // Do NOT wrap this component in React.memo.
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
