/**
 * Studique notes: the catalogue model, the subject matcher and the resource
 * ordering - a port of Campus App's studique_resource.dart,
 * studique_subject_matcher.dart and studique_catalogue.dart, so a subject
 * resolves to the same notes on the web as in the app.
 */

import type {
  StudiqueCatalogueFile,
  StudiqueFileEntry,
  StudiqueSemesterMap,
} from "@/network-calls/types";

export type ResourceKind = "notes" | "papers" | "syllabus";

export const RESOURCE_KINDS: readonly ResourceKind[] = ["notes", "papers", "syllabus"];

export const RESOURCE_KIND_LABEL: Record<ResourceKind, string> = {
  notes: "Notes",
  papers: "Past papers",
  syllabus: "Syllabus",
};

/** "1 note", "5 past papers" - the count reads as a sentence. */
export function resourceCountLabel(kind: ResourceKind, count: number): string {
  if (kind === "notes") return count === 1 ? "1 note" : `${count} notes`;
  if (kind === "papers") return count === 1 ? "1 past paper" : `${count} past papers`;
  return `${count} syllabus`;
}

export interface StudiqueResource {
  /** As published, e.g. `Unit 5||Dijkstras Algorithm`, `2024_May`. */
  name: string;
  url: string;
  kind: ResourceKind;
  /** What the reader sees. */
  title: string;
  unit: number | null;
  /** Year * 12 + month, for papers like `2024_May`. */
  examMonth: number | null;
  isQuestionBank: boolean;
}

export interface StudiqueSubject {
  name: string;
  semester: number | null;
  resources: StudiqueResource[];
  counts: Record<ResourceKind, number>;
}

/* ── resource names ── */

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};
const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const UNIT = /^unit\s*(\d+)/i;
const PAPER = /^(\d{4})[_\s-]+([A-Za-z]+)$/;
const QUESTION_BANK = /^qb\b[\s_-]*(.*)$/i;
const EXTENSION = /\.(pptx?|docx?|xlsx?|pdf|txt)\b.*$/i;

const clean = (value: string) => value.replace(EXTENSION, "").replace(/\s+/g, " ").trim();

function toResource(entry: StudiqueFileEntry, kind: ResourceKind): StudiqueResource | null {
  const name = String(entry.name ?? "").trim();
  const url = String(entry.url ?? "").trim();
  if (!url) return null;

  const unitMatch = UNIT.exec(name);
  const paper = PAPER.exec(name);
  const month = paper ? MONTHS[paper[2].toLowerCase()] : undefined;
  const examMonth = paper && month ? Number(paper[1]) * 12 + month : null;
  const bank = kind === "papers" ? QUESTION_BANK.exec(name) : null;

  let title: string;
  if (!name) title = "Untitled";
  else if (paper && month) title = `${MONTH_NAMES[month]} ${paper[1]}`;
  else if (bank) title = clean(bank[1] ?? "") ? `Question bank: ${clean(bank[1])}` : "Question bank";
  else if (name.includes("||")) title = clean(name.split("||").at(-1) ?? "") || clean(name);
  else title = clean(name) || "Untitled";

  return {
    name,
    url,
    kind,
    title,
    unit: unitMatch ? Number(unitMatch[1]) : null,
    examMonth,
    isQuestionBank: bank !== null,
  };
}

/** Newest paper first, units in order, everything else alphabetically after. */
export function compareResources(a: StudiqueResource, b: StudiqueResource): number {
  if (a.kind === "papers") {
    if (a.isQuestionBank !== b.isQuestionBank) return a.isQuestionBank ? 1 : -1;
    if (a.examMonth !== null && b.examMonth !== null) return b.examMonth - a.examMonth;
    if (a.examMonth !== null) return -1;
    if (b.examMonth !== null) return 1;
  }
  if (a.unit !== null && b.unit !== null && a.unit !== b.unit) return a.unit - b.unit;
  if (a.unit !== null && b.unit === null) return -1;
  if (a.unit === null && b.unit !== null) return 1;
  return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
}

/* ── matching ── */

const NOISE = new Set(["AND", "OF", "FOR", "THE", "TO", "IN", "A", "AN"]);
const MIN_CONFIDENCE = 0.6;
/** A winner must beat the runner-up by this much - wrong notes are worse than none. */
const MIN_MARGIN = 0.15;

/** Uppercase, drop "(DSA)"-style abbreviations and punctuation, collapse spaces. */
export function normaliseSubjectName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const tokens = (name: string) =>
  new Set(normaliseSubjectName(name).split(" ").filter((t) => t && !NOISE.has(t)));

export type SubjectMatcher = (name: string) => StudiqueSubject | null;

export function createSubjectMatcher(subjects: readonly StudiqueSubject[]): SubjectMatcher {
  const byName = new Map(subjects.map((s) => [normaliseSubjectName(s.name), s]));
  const tokenised = subjects.map((s) => ({ subject: s, tokens: tokens(s.name) }));

  return (name) => {
    if (!name.trim()) return null;
    const exact = byName.get(normaliseSubjectName(name));
    if (exact) return exact;

    const wanted = tokens(name);
    if (wanted.size === 0) return null;
    let best = 0;
    let runnerUp = 0;
    let winner: StudiqueSubject | null = null;
    for (const candidate of tokenised) {
      if (candidate.tokens.size === 0) continue;
      let overlap = 0;
      for (const t of wanted) if (candidate.tokens.has(t)) overlap++;
      if (overlap === 0) continue;
      const score = overlap / (wanted.size + candidate.tokens.size - overlap);
      if (score > best) {
        runnerUp = best;
        best = score;
        winner = candidate.subject;
      } else if (score > runnerUp) {
        runnerUp = score;
      }
    }
    return winner && best >= MIN_CONFIDENCE && best - runnerUp >= MIN_MARGIN ? winner : null;
  };
}

/* ── catalogue ── */

export interface NotesCatalogue {
  subjects: StudiqueSubject[];
  /** Semesters any subject can be placed in; empty hides the filter. */
  semesters: number[];
  match: SubjectMatcher;
  updatedAt: string;
}

const semesterFrom = (value: unknown): number | null => {
  const n = Number.parseInt(String(value ?? "").match(/\d+/)?.[0] ?? "", 10);
  return n >= 1 && n <= 8 ? n : null;
};

export function buildNotesCatalogue(file: StudiqueCatalogueFile, semesterMap: StudiqueSemesterMap): NotesCatalogue {
  const parsed: StudiqueSubject[] = (file.subjects ?? [])
    .map((entry) => {
      const resources = [
        ...(entry.ppts ?? []).map((r) => toResource(r, "notes")),
        ...(entry.pyqs ?? []).map((r) => toResource(r, "papers")),
        ...(entry.syllabus ?? []).map((r) => toResource(r, "syllabus")),
      ].filter((r): r is StudiqueResource => r !== null);
      const counts = { notes: 0, papers: 0, syllabus: 0 };
      for (const r of resources) counts[r.kind]++;
      return { name: String(entry.name ?? "").trim(), semester: semesterFrom(entry.semester), resources, counts };
    })
    .filter((s) => s.name && s.resources.length > 0);

  // Studique leaves `semester` empty; the shipped map fills it in, bridged by
  // the matcher because its keys are the portal's names, not Studique's.
  const match = createSubjectMatcher(parsed);
  const mapped = new Map<string, number>();
  for (const [name, value] of Object.entries(semesterMap)) {
    if (name.startsWith("_")) continue;
    const semester = semesterFrom(value);
    const subject = semester ? match(name) : null;
    if (subject && semester && !mapped.has(subject.name)) mapped.set(subject.name, semester);
  }
  const subjects = parsed
    .map((s) => (mapped.has(s.name) ? { ...s, semester: mapped.get(s.name)! } : s))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  const semesters = [...new Set(subjects.map((s) => s.semester).filter((n): n is number => n !== null))].sort((a, b) => a - b);
  return { subjects, semesters, match: createSubjectMatcher(subjects), updatedAt: file.updatedAt };
}

export interface NotesFilters {
  kind: ResourceKind | null;
  semester: number | null;
}

export const NO_NOTES_FILTERS: NotesFilters = { kind: null, semester: null };

export function subjectPassesFilters(subject: StudiqueSubject, filters: NotesFilters): boolean {
  if (filters.kind && subject.counts[filters.kind] === 0) return false;
  if (filters.semester !== null && subject.semester !== filters.semester) return false;
  return true;
}

export interface OwnCourse {
  title: string;
  subject: StudiqueSubject | null;
}

/** The reader's courses, each resolved to its Studique subject; a lecture and its lab collapse into one row. */
export function ownCourses(titles: readonly string[], match: SubjectMatcher): OwnCourse[] {
  const seen = new Set<string>();
  const result: OwnCourse[] = [];
  for (const raw of titles) {
    const title = raw.trim();
    if (!title) continue;
    const subject = match(title);
    const key = subject?.name ?? title.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ title, subject });
  }
  return result;
}
