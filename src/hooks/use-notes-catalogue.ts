"use client";

import { useQuery } from "@tanstack/react-query";

import { buildNotesCatalogue, type NotesCatalogue } from "@/lib/student/notes";
import { getStudiqueResources, getStudiqueSemesters } from "@/network-calls/getStudiqueCatalogue";
import { queryKeys } from "@/network-calls/query-keys";

/** The Studique catalogue, parsed once per visit - it only changes with a deploy. */
export function useNotesCatalogue() {
  return useQuery<NotesCatalogue>({
    queryKey: queryKeys.notes.catalogue,
    queryFn: async ({ signal }) => {
      const [file, semesters] = await Promise.all([getStudiqueResources(signal), getStudiqueSemesters(signal)]);
      return buildNotesCatalogue(file, semesters);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
