"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useStudentDataApi } from "@/hooks/use-student-data";
import type { StudiqueResource, StudiqueSubject } from "@/lib/student/notes";
import {
  EMPTY_SHELF,
  readShelf,
  withOpened,
  withPinToggled,
  writeShelf,
  type NotesShelf,
} from "@/lib/student/notes-store";
import { queryKeys } from "@/network-calls/query-keys";

/** Recently opened files and pinned subjects for this account - read once, written through. */
export function useNotesShelf() {
  const api = useStudentDataApi();
  const queryClient = useQueryClient();
  const key = queryKeys.notes.shelf(api.scope);
  const query = useQuery({
    queryKey: key,
    queryFn: () => readShelf(api.scope),
    enabled: api.ready,
    staleTime: Infinity,
  });
  const shelf = query.data ?? EMPTY_SHELF;

  const commit = useCallback(
    (next: NotesShelf) => {
      queryClient.setQueryData(key, next);
      void writeShelf(api.scope, next);
    },
    [queryClient, key, api.scope],
  );

  const markOpened = useCallback(
    (subject: StudiqueSubject, resource: StudiqueResource) =>
      commit(
        withOpened(
          queryClient.getQueryData<NotesShelf>(key) ?? EMPTY_SHELF,
          subject,
          resource,
        ),
      ),
    [commit, queryClient, key],
  );
  const togglePin = useCallback(
    (subject: string) =>
      commit(
        withPinToggled(
          queryClient.getQueryData<NotesShelf>(key) ?? EMPTY_SHELF,
          subject,
        ),
      ),
    [commit, queryClient, key],
  );
  const clearRecents = useCallback(
    () =>
      commit({
        ...(queryClient.getQueryData<NotesShelf>(key) ?? EMPTY_SHELF),
        recents: [],
      }),
    [commit, queryClient, key],
  );

  return {
    shelf,
    ready: query.data !== undefined,
    markOpened,
    togglePin,
    clearRecents,
  };
}
