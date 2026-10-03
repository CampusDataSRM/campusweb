"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";

import { AppToaster } from "@/components/feedback/app-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/context/session-context";
import { ThemeProvider } from "@/context/theme-context";
import { getQueryClient } from "@/lib/api/query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Lazily resolves the query client: browser singleton or per-request
  // instance on the server (see src/lib/api/query-client.ts).
  // Do NOT wrap this component in React.memo.
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider>
          {/* Honour the OS reduced-motion setting for every motion animation:
              transforms are dropped, opacity and colour fades remain. */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider>{children}</TooltipProvider>
          </MotionConfig>
          <AppToaster />
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
