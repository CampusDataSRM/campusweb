"use client";

import { Sigma } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { SgpaProjection } from "@/lib/student/sgpa";
import { cn } from "@/lib/utils";

/** The SGPA pill and its per-subject breakdown (grade, rule, counted or not). */
export function SgpaSheet({ projection, program, semester }: { projection: SgpaProjection; program?: string; semester?: string }) {
  const isMobile = useIsMobile();
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="tonal" size="touch" />}>
        <Sigma aria-hidden /> SGPA {projection.sgpa.toFixed(2)}
      </SheetTrigger>
      <SheetContent side={isMobile ? "bottom" : "right"} className="flex max-h-[92dvh] flex-col border-outline-variant bg-surface-modal data-[side=bottom]:rounded-t-3xl sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-h3 text-on-surface">Projected SGPA</SheetTitle>
          <SheetDescription className="text-on-surface-muted">
            Worked out from your internal marks so far{semester ? `, semester ${semester}` : ""}. End-semester marks are projected the same way the app does it.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
          <div className="flex items-end justify-between rounded-2xl bg-primary-container p-4 text-on-primary-container">
            <div>
              <p className="font-heading text-display font-extrabold tabular">{projection.sgpa.toFixed(2)}</p>
              {projection.isPartial && <Badge className="mt-1 rounded-full bg-warning text-on-warning">Partial</Badge>}
            </div>
            <dl className="text-right text-sm">
              <dt className="opacity-80">Credits</dt>
              <dd className="font-bold tabular">{projection.countedCredits}</dd>
            </dl>
          </div>
          <ul className="flex flex-col gap-2">
            {projection.subjects.map((subject) => (
              <li key={subject.courseCode} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-high p-3">
                <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl font-heading font-extrabold", subject.status === "pending" ? "bg-surface-highest text-on-surface-muted" : "bg-primary text-on-primary")}>
                  {subject.grade}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-on-surface">{subject.courseTitle}</p>
                  <p className="text-xs text-on-surface-muted">
                    {subject.status === "pending"
                      ? "No marks yet"
                      : `${subject.predictedFinal100} out of 100, ${subject.credit} credits${subject.countedInSgpa ? "" : ", not counted"}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {projection.notes.map((note) => (
            <p key={note} className="text-xs text-on-surface-muted">{note}</p>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
