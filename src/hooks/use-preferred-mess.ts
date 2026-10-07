"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { PREFERRED_MESS_KEY, type MessId } from "@/constants/mess";
import { isMessId } from "@/lib/student/mess";
import { storageGet, storageSet } from "@/lib/storage";

/** The student's mess, remembered on this device (IndexedDB). */
export function usePreferredMess() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["preferred-mess"],
    queryFn: async () => {
      const value = await storageGet<string>(PREFERRED_MESS_KEY);
      return isMessId(value) ? value : null;
    },
    staleTime: Infinity,
  });
  const choose = useCallback(
    (id: MessId) => {
      queryClient.setQueryData(["preferred-mess"], id);
      void storageSet(PREFERRED_MESS_KEY, id);
    },
    [queryClient],
  );
  return { mess: query.data ?? null, loaded: !query.isPending, choose };
}
