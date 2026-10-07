"use client";

/**
 * Club portal data and actions, authenticated with the club's JWT. A 401
 * means the token is no longer accepted: the club is signed out and sent to
 * the club sign-in, instead of every request failing in place.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { ROUTES } from "@/constants/auth";
import { useSession } from "@/context/session-context";
import { ApiError } from "@/lib/api/axios-client";
import { clubRequestConfig } from "@/lib/api/request-config";
import { notify } from "@/lib/toast";
import {
  patchResetPassword,
  postClubRegister,
  postForgotPassword,
  postUpdatePassword,
  putClubProfile,
} from "@/network-calls/clubAccount";
import { deleteClubEvent, postCreateEvent } from "@/network-calls/clubEventActions";
import { postClubLogin } from "@/network-calls/clubLogin";
import { fetchClubEvents } from "@/network-calls/getClubEvents";
import { queryKeys } from "@/network-calls/query-keys";
import type {
  ClubProfileInput,
  ClubRegisterInput,
  CreateEventInput,
  ResetPasswordRequest,
  UpdatePasswordRequest,
} from "@/network-calls/types";



function useClubAuth() {
  const { clubToken, hydrated, endClubSession } = useSession();
  const router = useRouter();
  const signOut = useCallback(async () => {
    await endClubSession();
    router.replace(ROUTES.clubLogin);
  }, [endClubSession, router]);
  return { token: clubToken, ready: hydrated && !!clubToken, config: clubRequestConfig(clubToken), signOut };
}

/** Signs the club out when a query reports the token was rejected. */
function useSignOutOnUnauthorized(error: unknown, signOut: () => Promise<void>) {
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      notify.error("Your club session has ended. Please sign in again.", { id: "club-auth" });
      void signOut();
    }
  }, [error, signOut]);
}

export function useClubEvents() {
  const auth = useClubAuth();
  const query = useQuery({
    queryKey: queryKeys.clubEvents.current,
    queryFn: async () => (await fetchClubEvents(auth.config)).data,
    enabled: auth.ready,
  });
  useSignOutOnUnauthorized(query.error, auth.signOut);
  return query;
}



export function useClubSignIn() {
  const { startClubSession } = useSession();
  const router = useRouter();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => postClubLogin(credentials),
    onSuccess: async (response) => {
      if (response.status !== "success" || !response.token) throw new Error("Sign-in didn't go through.");
      await startClubSession(response.token);
      notify.success("Welcome back");
      router.replace(ROUTES.club);
    },
  });
}

export function useClubSignOut() {
  const queryClient = useQueryClient();
  const { signOut } = useClubAuth();
  return useCallback(async () => {
    queryClient.removeQueries({ queryKey: ["club"] });
    queryClient.removeQueries({ queryKey: queryKeys.clubEvents.all });
    await signOut();
  }, [queryClient, signOut]);
}

export function useCreateEvent() {
  const auth = useClubAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => postCreateEvent(input, auth.config),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clubEvents.all }),
  });
}

export function useDeleteEvent() {
  const auth = useClubAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteClubEvent(eventId, auth.config),
    onSuccess: () => {
      notify.success("Event deleted");
      return queryClient.invalidateQueries({ queryKey: queryKeys.clubEvents.all });
    },
    onError: (error) => notify.error(error),
  });
}

export function useUpdateClubProfile() {
  const auth = useClubAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClubProfileInput) => putClubProfile(input, auth.config),
    onSuccess: () => {
      notify.success("Profile saved");
      return queryClient.invalidateQueries({ queryKey: queryKeys.clubEvents.all });
    },
    onError: (error) => notify.error(error),
  });
}

export function useUpdateClubPassword() {
  const auth = useClubAuth();
  return useMutation({
    mutationFn: (body: UpdatePasswordRequest) => postUpdatePassword(body, auth.config),
    onSuccess: () => notify.success("Password changed"),
    onError: (error) => notify.error(error),
  });
}

export function useRegisterClub() {
  return useMutation({ mutationFn: (input: ClubRegisterInput) => postClubRegister(input) });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => postForgotPassword(email) });
}

export function useResetPassword(token: string) {
  return useMutation({ mutationFn: (body: ResetPasswordRequest) => patchResetPassword(token, body) });
}
