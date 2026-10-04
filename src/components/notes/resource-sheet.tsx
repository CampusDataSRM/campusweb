"use client";

import {
  ExternalLink,
  FileText,
  GraduationCap,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
  type StudiqueSubject,
} from "@/lib/student/notes";

const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  notes: FileText,
  papers: GraduationCap,
  syllabus: ScrollText,
};

export function StudiqueCredit() {
  return (
    <p className="text-xs font-semibold text-on-surface-subtle">
      Notes and papers by Studique
    </p>
  );
}

/** Every file published for one subject, grouped notes / past papers / syllabus. */
export function ResourceSheet({
  subject,
  onOpenChange,
}: {
  subject: StudiqueSubject | null;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const groups = subject
    ? RESOURCE_KINDS.map((kind) => ({
        kind,
        items: subject.resources
          .filter((r) => r.kind === kind)
          .sort(compareResources),
      })).filter((group) => group.items.length > 0)
    : [];

  return (
    <Sheet open={subject !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex max-h-[85dvh] flex-col gap-0 border-outline-variant bg-surface-modal data-[side=bottom]:rounded-t-3xl sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="pr-8 text-h3 font-extrabold text-on-surface">
            {subject?.name}
          </SheetTitle>
          <SheetDescription render={<div />}>
            <StudiqueCredit />
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
          {groups.map(({ kind, items }) => {
            const Icon = KIND_ICON[kind];
            return (
              <section
                key={kind}
                aria-label={RESOURCE_KIND_LABEL[kind]}
                className="flex flex-col gap-2"
              >
                <h3 className="text-sm font-bold text-on-surface-muted">
                  {RESOURCE_KIND_LABEL[kind]}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {items.map((resource) => (
                    <li key={resource.url}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-12 items-center gap-3 rounded-xl bg-surface-high px-3 py-2.5 pressable hover:bg-surface-highest"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-container text-xs font-extrabold text-on-primary-container">
                          {resource.unit !== null ? (
                            `U${resource.unit}`
                          ) : (
                            <Icon aria-hidden className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-semibold text-on-surface">
                          {resource.title}
                        </span>
                        <ExternalLink
                          aria-hidden
                          className="size-4 shrink-0 text-on-surface-subtle"
                        />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
