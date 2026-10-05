"use client";

/**
 * Like / unlike events and clubs, optimistically: the list updates at once,
 * rolls back if the server refuses, and settles from the server after. A 409
 * ("already done") counts as success. Only real student sessions can like -
 * guests and the demo account see counts but cannot change them.
 */

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

import { useSession } from "@/context/session-context";
import { useStudentDataApi } from "@/hooks/use-student-data";
import { ApiError } from "@/lib/api/axios-client";
import { studentRequestConfig } from "@/lib/api/request-config";
import { notify } from "@/lib/toast";
import { putClubAction, putEventAction } from "@/network-calls/likeActions";
import { queryKeys } from "@/network-calls/query-keys";
import type { Club, ClubEvent, LikeAction } from "@/network-calls/types";

interface Likeable {
  id: string;
  likedby: string[];
  popularity: number;
}

function toggle<T extends Likeable>(items: T[] | undefined, id: string, reg: string, action: LikeAction) {
  return items?.map((item) =>
    item.id !== id
      ? item
      : {
          ...item,
          likedby: action === "like" ? [...(item.likedby ?? []), reg] : (item.likedby ?? []).filter((r) => r !== reg),
          popularity: Math.max(0, (item.popularity ?? 0) + (action === "like" ? 1 : -1)),
        },
  );
}

function useLikeMutation<T extends Likeable>(
  key: QueryKey,
  send: (id: string, action: LikeAction) => Promise<void>,
  registrationNumber: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: LikeAction }) => {
      try {
        await send(id, action);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) return;
        throw error;
      }
    },
    onMutate: async ({ id, action }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<T[]>(key);
      if (registrationNumber) {
        queryClient.setQueryData<T[]>(key, (items) => toggle(items, id, registrationNumber, action));
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      queryClient.setQueryData(key, context?.previous);
      notify.error("Couldn't save that. Please try again.", { id: "like" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useLikeActions(registrationNumber: string | undefined) {
  const { session } = useSession();
  const api = useStudentDataApi();
  const config = studentRequestConfig(session);
  const canLike =
    !!registrationNumber && (session?.kind === "academia" || session?.kind === "student-portal");

  const event = useLikeMutation<ClubEvent>(
    queryKeys.events.list(api.scope),
    (id, action) => putEventAction(id, action, config),
    registrationNumber,
  );
  const club = useLikeMutation<Club>(
    queryKeys.clubs.list(api.scope),
    (id, action) => putClubAction(id, action, config),
    registrationNumber,
  );

  return { canLike, likeEvent: event.mutate, likeClub: club.mutate };
}
