"use client";

import { Check, FileText, GraduationCap, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ResourceKind, StudiqueResource } from "@/lib/student/notes";
import { cn } from "@/lib/utils";

export const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  notes: FileText,
  papers: GraduationCap,
  syllabus: ScrollText,
};

const SHORT_MONTH: Record<string, string> = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

/** The two-or-three-character name a file goes by on a chip: U3, U3.1, Nov 24, QB. */
export function chipLabel(resource: StudiqueResource): string {
  const unit = /^unit\s*([\d.]+)/i.exec(resource.title);
  if (unit) return `U${unit[1]}`;
  const paper = /^([A-Z][a-z]+) (\d{4})$/.exec(resource.title);
  if (paper && SHORT_MONTH[paper[1]])
    return `${SHORT_MONTH[paper[1]]} ${paper[2].slice(2)}`;
  if (resource.isQuestionBank) return "QB";
  if (resource.kind === "syllabus") return "Syllabus";
  return resource.title.length > 14
    ? `${resource.title.slice(0, 13)}…`
    : resource.title;
}

/**
 * One file as a small button: its short name, a tick once opened. The full
 * title is the tooltip and the accessible name.
 */
export function FileChip({
  resource,
  opened,
  active,
  onClick,
  className,
}: {
  resource: StudiqueResource;
  opened?: boolean;
  active?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={resource.title}
      aria-label={`Read ${resource.title}${opened ? " (opened before)" : ""}`}
      aria-current={active || undefined}
      className={cn("notes-chip", className)}
      data-opened={opened || undefined}
      data-kind={resource.kind}
    >
      {opened && <Check aria-hidden className="size-3" />}
      {chipLabel(resource)}
    </button>
  );
}
