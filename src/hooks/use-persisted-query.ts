"use client";

/**
 * A query that paints from the offline cache first and refreshes behind it.
 *
 * Two queries cooperate:
 * - the network query fetches and, on success, saves the copy;
 * - the cache query reads the saved copy once (it never goes stale).
 * The live result always wins; until it arrives - or when it fails - the
 * saved copy is shown and `fromCache` says so, so screens can label it.
 *
 * `isLoading` is true only when there is nothing at all to show.
 */

import { useQuery, type QueryKey } from "@tanstack/react-query";

import { readCache, writeCache } from "@/lib/cache/offline-cache";

export interface PersistedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  /** Cache location: the account scope and a resource name. */
  cache: { scope: string; resource: string };
  enabled?: boolean;
  /** Reject a fetched value as unusable (it is then neither shown nor saved). */
  isUsable?: (value: T) => boolean;
  staleTime?: number;
}

export interface PersistedQueryResult<T> {
  data: T | undefined;
  /** The data on screen is the saved copy, not a fresh one. */
  fromCache: boolean;
  /** Epoch ms the shown copy was saved, when from cache. */
  savedAt: number | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

export class UnusableResponseError extends Error {
  constructor() {
    super("The server returned incomplete data.");
    this.name = "UnusableResponseError";
  }
}

export function usePersistedQuery<T>({
  queryKey,
  queryFn,
  cache,
  enabled = true,
  isUsable,
  staleTime,
}: PersistedQueryOptions<T>): PersistedQueryResult<T> {
  const network = useQuery({
    queryKey,
    enabled,
    staleTime,
    queryFn: async () => {
      const value = await queryFn();
      if (isUsable && !isUsable(value)) throw new UnusableResponseError();
      void writeCache(cache.scope, cache.resource, value);
      return value;
    },
  });

  const saved = useQuery({
    queryKey: [...queryKey, "offline-copy"],
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => readCache<T>(cache.scope, cache.resource),
  });

  const live = network.data;
  const copy = saved.data ?? null;
  const fromCache = live === undefined && copy !== null;

  return {
    data: live ?? copy?.data,
    fromCache,
    savedAt: fromCache ? copy.savedAt : null,
    isLoading:
      live === undefined &&
      copy === null &&
      (network.isPending || saved.isPending) &&
      enabled,
    isFetching: network.isFetching,
    error: network.error,
    refetch: network.refetch,
  };
}
