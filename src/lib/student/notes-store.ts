/**
 * The reader's notes shelf, per account, in persistent storage: the files
 * they opened most recently (so they can pick up where they left off) and
 * the subjects they pinned to the top.
 */

import { storageGet, storageSet } from "@/lib/storage";
import type { StudiqueResource, StudiqueSubject } from "@/lib/student/notes";

export interface RecentNote {
  /** The file's url - stable, and how it is found in the catalogue again. */
  url: string;
  subject: string;
  title: string;
  kind: StudiqueResource["kind"];
  unit: number | null;
  /** When it was last opened, ms since epoch. */
  at: number;
}

export interface NotesShelf {
  recents: RecentNote[];
  /** Subject names, most recently pinned first. */
  pinned: string[];
  /** Every file url ever opened, newest first - for "3 of 5 units opened". */
  opened: string[];
}

export const EMPTY_SHELF: NotesShelf = { recents: [], pinned: [], opened: [] };
export const MAX_RECENTS = 12;
const MAX_OPENED = 600;

const keyFor = (scope: string) => `notes-shelf:${scope}`;

export async function readShelf(scope: string): Promise<NotesShelf> {
  const stored = await storageGet<Partial<NotesShelf>>(keyFor(scope));
  return {
    recents: Array.isArray(stored?.recents)
      ? stored.recents.filter((r) => r && r.url)
      : [],
    pinned: Array.isArray(stored?.pinned)
      ? stored.pinned.filter((p) => typeof p === "string")
      : [],
    opened: Array.isArray(stored?.opened)
      ? stored.opened.filter((p) => typeof p === "string")
      : [],
  };
}

export function writeShelf(scope: string, shelf: NotesShelf): Promise<void> {
  return storageSet(keyFor(scope), shelf);
}

/** The shelf with this file moved to the front of the recents. */
export function withOpened(
  shelf: NotesShelf,
  subject: StudiqueSubject,
  resource: StudiqueResource,
  at = Date.now(),
): NotesShelf {
  const entry: RecentNote = {
    url: resource.url,
    subject: subject.name,
    title: resource.title,
    kind: resource.kind,
    unit: resource.unit,
    at,
  };
  return {
    ...shelf,
    recents: [
      entry,
      ...shelf.recents.filter((r) => r.url !== resource.url),
    ].slice(0, MAX_RECENTS),
    opened: [
      resource.url,
      ...shelf.opened.filter((u) => u !== resource.url),
    ].slice(0, MAX_OPENED),
  };
}

export function withPinToggled(shelf: NotesShelf, subject: string): NotesShelf {
  return {
    ...shelf,
    pinned: shelf.pinned.includes(subject)
      ? shelf.pinned.filter((p) => p !== subject)
      : [subject, ...shelf.pinned],
  };
}

/** Google Drive's file id from a `/file/d/<id>/...` link, for the download url. */
export function driveFileId(url: string): string | null {
  return /\/file\/d\/([^/?#]+)/.exec(url)?.[1] ?? null;
}

export function driveDownloadUrl(url: string): string | null {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}

/** The link to read a file in the page: Drive's embeddable preview. */
export function driveEmbedUrl(url: string): string {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}
