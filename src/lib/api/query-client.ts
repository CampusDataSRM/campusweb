/**
 * TanStack Query client factory.
 *
 * Follows TanStack Query's official "Advanced Server Rendering" pattern:
 * - Browser: a module-level singleton survives route transitions, so cached
 *   data persists across client-side navigations.
 * - Server: React cache() gives every HTTP request its own QueryClient, so
 *   prefetched data and dehydrated state never leak between requests/users.
 *
 * staleTime 60s prevents immediate refetch-on-mount after hydration.
 */

import { cache } from "react";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // Include pending queries so streamed/prefetched data hydrates too.
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

const browserQueryClient: QueryClient | undefined = isServer
  ? undefined
  : makeQueryClient();

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always a fresh, request-scoped client (cached per request).
    return cache(makeQueryClient)();
  }
  // Browser: reuse the singleton.
  return browserQueryClient as QueryClient;
}
