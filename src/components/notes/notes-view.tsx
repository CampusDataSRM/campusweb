"use client";

import {
  BookOpen,
  CalendarDays,
  History,
  MoreHorizontal,
  Pin,
  Play,
  Search,
  X,
} from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

import {
  EmptyState,
  ErrorState,
  ShimmerBlock,
  timeAgo,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { FileChip, KIND_ICON } from "@/components/notes/file-chip";
import {
  ResourceSheet,
  StudiqueCredit,
  groupOf,
} from "@/components/notes/resource-sheet";
import { ResourceViewer } from "@/components/notes/resource-viewer";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import { useNotesCatalogue } from "@/hooks/use-notes-catalogue";
import { useNotesShelf } from "@/hooks/use-notes-shelf";
import { useProfile } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import {
  NO_NOTES_FILTERS,
  RESOURCE_KINDS,
  RESOURCE_KIND_LABEL,
  normaliseSubjectName,
  ownCourses,
  subjectPassesFilters,
  type NotesFilters,
  type ResourceKind,
  type StudiqueResource,
  type StudiqueSubject,
} from "@/lib/student/notes";
import type { RecentNote } from "@/lib/student/notes-store";

const EVERYTHING = "all";
const SUBJECT_PARAM = "subject";
/** Chips shown per group on a card before "+n more". */
const MAX_CHIPS = 8;

interface Open {
  subject: StudiqueSubject;
  resource: StudiqueResource;
}

/**
 * A subject with its files right on it - one tap to read any unit, paper
 * or the syllabus. Shows how much of it has been opened, and a "Continue"
 * for the file last read.
 */
function SubjectCard({
  subject,
  pinned,
  today,
  opened,
  lastOpened,
  kind,
  onRead,
  onMore,
  onTogglePin,
  index = 0,
}: {
  subject: StudiqueSubject;
  pinned: boolean;
  today: boolean;
  opened: ReadonlySet<string>;
  lastOpened?: RecentNote;
  /** When the page is filtered to one kind, only that group shows. */
  kind: ResourceKind | null;
  onRead: (subject: StudiqueSubject, resource: StudiqueResource) => void;
  onMore: (subject: StudiqueSubject) => void;
  onTogglePin: (name: string) => void;
  index?: number;
}) {
  const groups = (kind ? [kind] : RESOURCE_KINDS)
    .map((k) => ({ kind: k, items: groupOf(subject, k) }))
    .filter((g) => g.items.length > 0);
  const notes = groupOf(subject, "notes");
  const read = notes.filter((r) => opened.has(r.url)).length;
  const total = subject.resources.length;
  const continueWith = lastOpened
    ? subject.resources.find((r) => r.url === lastOpened.url)
    : undefined;

  return (
    <li
      className="notes-card panel"
      data-today={today || undefined}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="notes-card-head">
        <button
          type="button"
          className="notes-card-title"
          onClick={() => onMore(subject)}
          aria-label={`${subject.name}: all ${total} files`}
        >
          <span className="notes-subject-icon" aria-hidden>
            <BookOpen className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-bold text-on-surface">{subject.name}</span>
              {today && (
                <span className="notes-tag" data-tone="today">
                  <CalendarDays aria-hidden className="size-3" /> Today
                </span>
              )}
              {subject.semester && (
                <span className="notes-tag">Sem {subject.semester}</span>
              )}
            </span>
            <span className="notes-card-sub">
              {total} {total === 1 ? "file" : "files"}
              {notes.length > 0 &&
                read > 0 &&
                ` · ${read} of ${notes.length} notes opened`}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="notes-pin"
          aria-pressed={pinned}
          aria-label={
            pinned ? `Unpin ${subject.name}` : `Pin ${subject.name} to the top`
          }
          onClick={() => onTogglePin(subject.name)}
        >
          <Pin aria-hidden className="size-4" />
        </button>
      </div>

      {notes.length > 0 && read > 0 && (
        <span className="notes-card-progress" aria-hidden>
          <span style={{ width: `${(read / notes.length) * 100}%` }} />
        </span>
      )}

      <div className="notes-card-groups">
        {groups.map(({ kind: k, items }) => {
          const Icon = KIND_ICON[k];
          const shown = items.slice(0, MAX_CHIPS);
          return (
            <div key={k} className="notes-card-group">
              <span className="notes-card-group-label">
                <Icon aria-hidden className="size-3.5" />
                {RESOURCE_KIND_LABEL[k]}
              </span>
              <span className="notes-card-chips">
                {shown.map((r) => (
                  <FileChip
                    key={r.url}
                    resource={r}
                    opened={opened.has(r.url)}
                    onClick={() => onRead(subject, r)}
                  />
                ))}
                {items.length > shown.length && (
                  <button
                    type="button"
                    className="notes-chip"
                    data-more
                    onClick={() => onMore(subject)}
                    aria-label={`${items.length - shown.length} more ${RESOURCE_KIND_LABEL[k].toLowerCase()}`}
                  >
                    <MoreHorizontal aria-hidden className="size-3.5" />+
                    {items.length - shown.length}
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {continueWith && lastOpened && (
        <button
          type="button"
          className="notes-card-continue"
          onClick={() => onRead(subject, continueWith)}
        >
          <Play aria-hidden className="size-3.5" />
          Continue <strong>{continueWith.title}</strong>
          <span>· {timeAgo(lastOpened.at)}</span>
        </button>
      )}
    </li>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-2 text-lg font-extrabold text-on-surface">{children}</h2>
  );
}

const monthYear = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
});

/**
 * Studique notes, past papers and syllabus. Every file is one tap from the
 * list and opens in the page; the ones opened last are at the top; pinned
 * subjects and the ones on today's timetable lead your list; search finds
 * files as well as subjects; `?subject=` opens a subject straight away.
 */
export function NotesView() {
  const catalogue = useNotesCatalogue();
  const profile = useProfile();
  const today = useToday();
  const { shelf, markOpened, togglePin, clearRecents } = useNotesShelf();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<NotesFilters>(NO_NOTES_FILTERS);
  const [reading, setReading] = useState<Open | null>(null);

  const data = catalogue.data;
  // What the url asked for on arrival; `undefined` until the reader picks or closes something.
  const [wanted] = useState(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get(SUBJECT_PARAM),
  );
  const [chosen, setChosen] = useState<StudiqueSubject | null | undefined>(
    undefined,
  );
  const open =
    chosen !== undefined
      ? chosen
      : wanted && data
        ? (data.subjects.find((s) => s.name === wanted) ?? data.match(wanted))
        : null;

  const term = normaliseSubjectName(deferredQuery);
  const filtered = filters.kind !== null || filters.semester !== null;
  const browsing = term === "" && !filtered;
  const pinnedSet = useMemo(() => new Set(shelf.pinned), [shelf.pinned]);
  const openedSet = useMemo(() => new Set(shelf.opened), [shelf.opened]);

  const all = useMemo(
    () =>
      (data?.subjects ?? []).filter(
        (s) =>
          subjectPassesFilters(s, filters) &&
          (term === "" || normaliseSubjectName(s.name).includes(term)),
      ),
    [data, filters, term],
  );

  // Files whose titles match the search - "dijkstra", "2024 nov", "unit 3".
  const files = useMemo(() => {
    if (!data || term.length < 2) return [];
    const out: Open[] = [];
    for (const subject of data.subjects) {
      if (!subjectPassesFilters(subject, filters)) continue;
      for (const resource of subject.resources) {
        if (normaliseSubjectName(resource.title).includes(term))
          out.push({ subject, resource });
        if (out.length >= 24) return out;
      }
    }
    return out;
  }, [data, filters, term]);

  const todaySet = useMemo(() => {
    const set = new Set<string>();
    if (!data) return set;
    for (const c of today.classes) {
      const hit = data.match(c.subject);
      if (hit) set.add(hit.name);
    }
    return set;
  }, [data, today.classes]);

  const lastBySubject = useMemo(() => {
    const map = new Map<string, RecentNote>();
    for (const r of shelf.recents)
      if (!map.has(r.subject)) map.set(r.subject, r);
    return map;
  }, [shelf.recents]);

  const own = useMemo(() => {
    if (!data || term !== "")
      return { matched: [] as StudiqueSubject[], unpublished: [] as string[] };
    const rows = ownCourses(
      (profile.data?.courses ?? []).map((c) => c.courseTitle),
      data.match,
    );
    const matched = rows
      .map((c) => c.subject)
      .filter(
        (s): s is StudiqueSubject =>
          s !== null && (browsing || subjectPassesFilters(s, filters)),
      );
    // Pinned first, then what's on today, then the rest in timetable order.
    const rank = (s: StudiqueSubject) =>
      pinnedSet.has(s.name) ? 0 : todaySet.has(s.name) ? 1 : 2;
    matched.sort((a, b) => rank(a) - rank(b));
    const seen = new Set(matched.map((s) => s.name));
    // Pinned subjects that aren't on the timetable still belong at the top.
    const extra = browsing
      ? shelf.pinned
          .filter((name) => !seen.has(name))
          .map((name) => data.subjects.find((s) => s.name === name))
          .filter((s): s is StudiqueSubject => s !== undefined)
      : [];
    return {
      matched: [...extra, ...matched],
      unpublished: browsing
        ? rows.filter((c) => !c.subject).map((c) => c.title)
        : [],
    };
  }, [
    data,
    profile.data,
    term,
    browsing,
    filters,
    pinnedSet,
    todaySet,
    shelf.pinned,
  ]);

  const recents = useMemo(() => {
    if (!data || !browsing) return [];
    return shelf.recents
      .map((r) => {
        const subject = data.subjects.find((s) => s.name === r.subject);
        const resource = subject?.resources.find((x) => x.url === r.url);
        return subject && resource ? { note: r, subject, resource } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(0, 6);
  }, [data, browsing, shelf.recents]);

  const read = useCallback(
    (subject: StudiqueSubject, resource: StudiqueResource) => {
      setReading({ subject, resource });
      markOpened(subject, resource);
    },
    [markOpened],
  );

  // The url follows what's open, so a subject can be shared or bookmarked.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (open) url.searchParams.set(SUBJECT_PARAM, open.name);
    else url.searchParams.delete(SUBJECT_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [open]);

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
    return (
      <div className="campus-view notes-page flex flex-col gap-6">
        <PageHeader
          title="Notes"
          description="Your resource shelf for the semester."
        />
        <ErrorState
          error={catalogue.error}
          title="Notes are unavailable right now"
          onRetry={() => catalogue.refetch()}
          retrying={catalogue.isFetching}
        />
      </div>
    );
  }

  const fileCount = data.subjects.reduce((n, s) => n + s.resources.length, 0);
  const updated = Date.parse(data.updatedAt);
  const emptyMessage = term
    ? `Nothing published for "${deferredQuery.trim()}".`
    : filters.kind
      ? `No subject has ${RESOURCE_KIND_LABEL[filters.kind].toLowerCase()} yet.`
      : "Nothing published for this semester yet.";

  const card = (subject: StudiqueSubject, index: number) => (
    <SubjectCard
      key={subject.name}
      subject={subject}
      pinned={pinnedSet.has(subject.name)}
      today={todaySet.has(subject.name)}
      opened={openedSet}
      lastOpened={lastBySubject.get(subject.name)}
      kind={filters.kind}
      onRead={read}
      onMore={setChosen}
      onTogglePin={togglePin}
      index={index}
    />
  );

  return (
    <div className="campus-view notes-page flex flex-col gap-6">
      <PageHeader
        title="Notes"
        description={`Unit notes, past papers and the syllabus - every file one tap away. ${data.subjects.length} subjects · ${fileCount} files${Number.isFinite(updated) ? ` · updated ${monthYear.format(updated)}` : ""}.`}
      />

      <div className="notes-toolbar flex flex-col gap-3">
        <InputGroup className="h-12 rounded-2xl bg-surface-container">
          <InputGroupAddon>
            <Search aria-hidden className="size-5" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setQuery("")}
            placeholder="Search subjects and files - try “unit 3” or “2024 nov”"
            aria-label="Search subjects and files"
            className="text-base"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Material"
            size="sm"
            value={filters.kind ?? EVERYTHING}
            onChange={(value) =>
              setFilters((f) => ({
                ...f,
                kind: value === EVERYTHING ? null : (value as ResourceKind),
              }))
            }
            options={[EVERYTHING, ...RESOURCE_KINDS].map((kind) => ({
              value: kind,
              label:
                kind === EVERYTHING
                  ? "Everything"
                  : RESOURCE_KIND_LABEL[kind as ResourceKind],
            }))}
          />
          {data.semesters.length > 0 && (
            <Select
              value={
                filters.semester === null
                  ? EVERYTHING
                  : String(filters.semester)
              }
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  semester:
                    value === EVERYTHING || value === null
                      ? null
                      : Number(value),
                }))
              }
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(NO_NOTES_FILTERS)}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {recents.length > 0 && (
        <section aria-label="Recently opened" className="notes-recents">
          <div className="campus-toolbar mb-2">
            <GroupLabel>Pick up where you left off</GroupLabel>
            <Button variant="ghost" size="sm" onClick={clearRecents}>
              Clear
            </Button>
          </div>
          <ul className="notes-recent-list">
            {recents.map(({ note, subject, resource }, i) => {
              const Icon = KIND_ICON[resource.kind];
              return (
                <li key={note.url} style={{ "--i": i } as CSSProperties}>
                  <button
                    type="button"
                    className="notes-recent panel pressable"
                    onClick={() => read(subject, resource)}
                  >
                    <span className="notes-file-badge" aria-hidden>
                      {resource.unit !== null ? (
                        `U${resource.unit}`
                      ) : (
                        <Icon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-on-surface">
                        {resource.title}
                      </span>
                      <span className="block truncate text-xs text-on-surface-muted">
                        {subject.name}
                      </span>
                      <span className="notes-recent-when">
                        {timeAgo(note.at)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {all.length === 0 && files.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={emptyMessage}
          description="Try another name or clear the filters."
        />
      ) : (
        <>
          {files.length > 0 && (
            <section aria-label="Matching files">
              <div className="campus-toolbar mb-3">
                <GroupLabel>Files</GroupLabel>
                <p className="campus-caption">
                  {files.length === 24
                    ? "First 24 matches"
                    : `${files.length} ${files.length === 1 ? "file" : "files"}`}
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                {files.map(({ subject, resource }) => {
                  const Icon = KIND_ICON[resource.kind];
                  return (
                    <li key={resource.url}>
                      <button
                        type="button"
                        onClick={() => read(subject, resource)}
                        className="notes-file pressable"
                      >
                        <span className="notes-file-badge" aria-hidden>
                          {resource.unit !== null ? (
                            `U${resource.unit}`
                          ) : (
                            <Icon className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-on-surface">
                            {resource.title}
                          </span>
                          <span className="block truncate text-xs text-on-surface-muted">
                            {subject.name} ·{" "}
                            {RESOURCE_KIND_LABEL[resource.kind]}
                          </span>
                        </span>
                        <span className="notes-file-open">Read</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {own.matched.length + own.unpublished.length > 0 ? (
            <section aria-label="Your subjects">
              <GroupLabel>Your subjects</GroupLabel>
              <ul className="notes-grid">{own.matched.map(card)}</ul>
              {own.unpublished.length > 0 && (
                <p className="notes-unpublished">
                  <History aria-hidden className="size-3.5" />
                  Nothing published yet for{" "}
                  <span className="capitalize">
                    {own.unpublished.map((t) => t.toLowerCase()).join(", ")}.
                  </span>
                </p>
              )}
            </section>
          ) : (
            browsing &&
            profile.isLoading && (
              <section aria-label="Your subjects">
                <GroupLabel>Your subjects</GroupLabel>
                <p className="text-sm text-on-surface-muted">
                  Finding the subjects on your timetable…
                </p>
              </section>
            )
          )}
          {all.length > 0 && (
            <section aria-label={browsing ? "All subjects" : "Results"}>
              <div className="campus-toolbar mb-3">
                <GroupLabel>
                  {browsing ? "All subjects" : "Subjects"}
                </GroupLabel>
                <p className="campus-caption" aria-live="polite">
                  {all.length} {all.length === 1 ? "subject" : "subjects"}
                </p>
              </div>
              <ul className="notes-grid">
                {all.map((s, i) => card(s, Math.min(i, 12)))}
              </ul>
            </section>
          )}
        </>
      )}

      <StudiqueCredit />
      <ResourceSheet
        subject={open}
        recents={shelf.recents}
        pinned={open ? pinnedSet.has(open.name) : false}
        onTogglePin={togglePin}
        onOpen={read}
        onOpenChange={(next) => !next && setChosen(null)}
      />
      <ResourceViewer
        subject={reading?.subject ?? null}
        resource={reading?.resource ?? null}
        opened={openedSet}
        pinned={reading ? pinnedSet.has(reading.subject.name) : false}
        onTogglePin={togglePin}
        onNavigate={(resource) => reading && read(reading.subject, resource)}
        onOpenChange={(next) => !next && setReading(null)}
      />
    </div>
  );
}
