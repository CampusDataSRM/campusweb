"use client";

import { Check, ExternalLink, Pin, PinOff } from "lucide-react";
import Image from "next/image";
import { useState, type CSSProperties } from "react";

import { timeAgo } from "@/components/feedback/data-states";
import { KIND_ICON } from "@/components/notes/file-chip";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  RESOURCE_KINDS,
  RESOURCE_KIND_LABEL,
  compareResources,
  type ResourceKind,
  type StudiqueResource,
  type StudiqueSubject,
} from "@/lib/student/notes";
import type { RecentNote } from "@/lib/student/notes-store";
import styles from "./studique-credit.module.css";

export { KIND_ICON };

export function StudiqueCredit({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      className={styles.credit}
      data-compact={compact || undefined}
      aria-label="Notes by Studique — open Mealmap in a new tab"
      onClick={() =>
        window.open(
          "https://www.studique.in/mealmap",
          "_blank",
          "noopener,noreferrer",
        )
      }
    >
      <Image
        src="/assets/studique/logo.png"
        alt=""
        width={16}
        height={16}
        className={styles.logo}
      />
      <span>Notes by Studique</span>
    </button>
  );
}

/** The files in one group, in reading order. */
export function groupOf(
  subject: StudiqueSubject,
  kind: ResourceKind,
): StudiqueResource[] {
  return subject.resources
    .filter((r) => r.kind === kind)
    .sort(compareResources);
}

/**
 * Every file published for one subject as a full list - for subjects with
 * more files than fit on their card. Each opens in the reader; files opened
 * before say when.
 */
export function ResourceSheet({
  subject,
  recents,
  pinned,
  onTogglePin,
  onOpen,
  onOpenChange,
}: {
  subject: StudiqueSubject | null;
  recents: RecentNote[];
  pinned: boolean;
  onTogglePin: (subject: string) => void;
  onOpen: (subject: StudiqueSubject, resource: StudiqueResource) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const kinds = subject
    ? RESOURCE_KINDS.filter((k) => subject.counts[k] > 0)
    : [];
  // The tab picked for this subject; a fresh subject opens on its first group with files.
  const [picked, setPicked] = useState<{
    subject: string;
    kind: ResourceKind;
  } | null>(null);
  const kind: ResourceKind =
    picked && picked.subject === subject?.name && kinds.includes(picked.kind)
      ? picked.kind
      : (kinds[0] ?? "notes");
  const setKind = (next: ResourceKind) =>
    subject && setPicked({ subject: subject.name, kind: next });

  const items = subject ? groupOf(subject, kind) : [];
  const opened = new Map(recents.map((r) => [r.url, r.at]));
  const Icon = KIND_ICON[kind];
  const total = subject ? subject.resources.length : 0;

  return (
    <Sheet open={subject !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex max-h-[88dvh] flex-col gap-0 border-outline-variant bg-surface-modal data-[side=bottom]:rounded-t-3xl sm:max-w-md"
      >
        <SheetHeader className="gap-1">
          <SheetTitle className="pr-8 text-h3 font-extrabold text-on-surface">
            {subject?.name}
          </SheetTitle>
          <SheetDescription
            render={<div />}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-muted"
          >
            {subject?.semester && <span>Semester {subject.semester}</span>}
            <span>
              {total} {total === 1 ? "file" : "files"}
            </span>
            <StudiqueCredit compact />
          </SheetDescription>
          {subject && (
            <Button
              variant={pinned ? "tonal" : "outline"}
              size="sm"
              className="mt-2 w-fit"
              aria-pressed={pinned}
              onClick={() => onTogglePin(subject.name)}
            >
              {pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}
              {pinned ? "Unpin" : "Pin to top"}
            </Button>
          )}
        </SheetHeader>

        {kinds.length > 1 && subject && (
          <div className="px-4 pb-3">
            <Segmented
              label="Material"
              size="sm"
              stretch
              value={kind}
              onChange={setKind}
              options={kinds.map((k) => ({
                value: k,
                label: (
                  <>
                    {RESOURCE_KIND_LABEL[k]}{" "}
                    <span className="campus-tab-count">
                      {subject.counts[k]}
                    </span>
                  </>
                ),
              }))}
            />
          </div>
        )}

        <ul className="notes-files flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 pb-6">
          {items.map((resource, i) => {
            const at = opened.get(resource.url);
            return (
              <li key={resource.url} style={{ "--i": i } as CSSProperties}>
                <button
                  type="button"
                  onClick={() => subject && onOpen(subject, resource)}
                  className="notes-file pressable"
                  data-opened={at ? "" : undefined}
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
                    {at && (
                      <span className="notes-file-opened">
                        <Check aria-hidden className="size-3" />
                        Opened {timeAgo(at)}
                      </span>
                    )}
                  </span>
                  <span className="notes-file-open">Read</span>
                </button>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="notes-file-external"
                  aria-label={`Open ${resource.title} in Drive`}
                >
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              </li>
            );
          })}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
