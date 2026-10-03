"use client";

import { BookOpen, ChevronRight, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceSheet, StudiqueCredit } from "@/components/notes/resource-sheet";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useNotesCatalogue } from "@/hooks/use-notes-catalogue";
import { useProfile } from "@/hooks/use-student-data";
import {
  NO_NOTES_FILTERS,
  RESOURCE_KINDS,
  RESOURCE_KIND_LABEL,
  normaliseSubjectName,
  ownCourses,
  resourceCountLabel,
  subjectPassesFilters,
  type NotesFilters,
  type ResourceKind,
  type StudiqueSubject,
} from "@/lib/student/notes";

const EVERYTHING = "all";

function SubjectRow({ subject, onOpen }: { subject: StudiqueSubject; onOpen: (s: StudiqueSubject) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(subject)}
        className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3 text-left pressable hover:border-outline hover:bg-surface-high"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-on-surface">{subject.name}</span>
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {RESOURCE_KINDS.filter((kind) => subject.counts[kind] > 0).map((kind) => (
              <span key={kind} className="rounded-md bg-surface-highest px-2 py-0.5 text-xs font-semibold text-on-surface-muted">
                {resourceCountLabel(kind, subject.counts[kind])}
              </span>
            ))}
          </span>
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-on-surface-subtle" />
      </button>
    </li>
  );
}

function UnpublishedRow({ title }: { title: string }) {
  return (
    <li className="flex min-h-14 items-center gap-3 rounded-2xl border border-dashed border-outline-variant px-4 py-3">
      <span className="min-w-0 flex-1">
        <span className="block font-semibold capitalize text-on-surface-muted">{title.toLowerCase()}</span>
        <span className="text-xs text-on-surface-subtle">No notes published yet</span>
      </span>
    </li>
  );
}

function GroupLabel({ children }: { children: string }) {
  return <h2 className="mb-2 text-lg font-extrabold text-on-surface">{children}</h2>;
}

/** Studique notes, past papers and syllabus - your subjects first, then everything. */
export function NotesView() {
  const catalogue = useNotesCatalogue();
  const profile = useProfile();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<NotesFilters>(NO_NOTES_FILTERS);
  const [open, setOpen] = useState<StudiqueSubject | null>(null);

  const data = catalogue.data;
  const term = normaliseSubjectName(deferredQuery);
  const filtered = filters.kind !== null || filters.semester !== null;
  const browsing = term === "" && !filtered;

  const all = useMemo(
    () =>
      (data?.subjects ?? []).filter(
        (s) => subjectPassesFilters(s, filters) && (term === "" || normaliseSubjectName(s.name).includes(term)),
      ),
    [data, filters, term],
  );

  const mine = useMemo(() => {
    if (!data || term !== "") return [];
    const own = ownCourses((profile.data?.courses ?? []).map((c) => c.courseTitle), data.match);
    return browsing ? own : own.filter((c) => c.subject && subjectPassesFilters(c.subject, filters));
  }, [data, profile.data, term, browsing, filters]);

  if (catalogue.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Notes" />
        <ShimmerBlock className="h-12" />
        <ShimmerBlock className="h-96" />
      </div>
    );
  }
  if (!data) {
    return <ErrorState error={catalogue.error} title="Notes are unavailable right now" onRetry={() => catalogue.refetch()} retrying={catalogue.isFetching} />;
  }

  const emptyMessage = term
    ? `Nothing published for "${deferredQuery.trim()}".`
    : filters.kind
      ? `No subject has ${RESOURCE_KIND_LABEL[filters.kind].toLowerCase()} yet.`
      : "Nothing published for this semester yet.";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notes" description="Unit notes, past papers and the syllabus for your subjects." />

      <div className="flex flex-col gap-3">
        <InputGroup className="h-12 rounded-2xl bg-surface-container">
          <InputGroupAddon>
            <Search aria-hidden className="size-5" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subjects"
            aria-label="Search subjects"
            className="text-base"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-sm" aria-label="Clear search" onClick={() => setQuery("")}>
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            value={[filters.kind ?? EVERYTHING]}
            onValueChange={(value) => value[0] && setFilters((f) => ({ ...f, kind: value[0] === EVERYTHING ? null : (value[0] as ResourceKind) }))}
            aria-label="Material"
            className="flex flex-wrap gap-1.5"
          >
            {[EVERYTHING, ...RESOURCE_KINDS].map((kind) => (
              <ToggleGroupItem
                key={kind}
                value={kind}
                className="h-9 rounded-full border border-outline-variant px-4 text-sm font-bold data-[pressed]:border-transparent data-[pressed]:bg-primary data-[pressed]:text-on-primary"
              >
                {kind === EVERYTHING ? "Everything" : RESOURCE_KIND_LABEL[kind as ResourceKind]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {data.semesters.length > 0 && (
            <Select
              value={filters.semester === null ? EVERYTHING : String(filters.semester)}
              onValueChange={(value) => setFilters((f) => ({ ...f, semester: value === EVERYTHING || value === null ? null : Number(value) }))}
            >
              <SelectTrigger aria-label="Semester" className="h-9 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EVERYTHING}>Any semester</SelectItem>
                {data.semesters.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Semester {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {filtered && (
            <Button variant="ghost" size="sm" onClick={() => setFilters(NO_NOTES_FILTERS)}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {all.length === 0 ? (
        <EmptyState icon={BookOpen} title={emptyMessage} description="Try another name or clear the filters." />
      ) : (
        <>
          {mine.length > 0 ? (
            <section aria-label="Your subjects">
              <GroupLabel>Your subjects</GroupLabel>
              <ul className="grid gap-2 md:grid-cols-2">
                {mine.map((course) =>
                  course.subject ? (
                    <SubjectRow key={course.title} subject={course.subject} onOpen={setOpen} />
                  ) : (
                    <UnpublishedRow key={course.title} title={course.title} />
                  ),
                )}
              </ul>
            </section>
          ) : (
            browsing &&
            profile.isLoading && (
              <section aria-label="Your subjects">
                <GroupLabel>Your subjects</GroupLabel>
                <p className="text-sm text-on-surface-muted">Finding the subjects on your timetable…</p>
              </section>
            )
          )}
          <section aria-label={browsing ? "All subjects" : "Results"}>
            {browsing && <GroupLabel>All subjects</GroupLabel>}
            <ul className="grid gap-2 md:grid-cols-2">
              {all.map((subject) => (
                <SubjectRow key={subject.name} subject={subject} onOpen={setOpen} />
              ))}
            </ul>
          </section>
        </>
      )}

      <StudiqueCredit />
      <ResourceSheet subject={open} onOpenChange={(next) => !next && setOpen(null)} />
    </div>
  );
}
