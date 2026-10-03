"use client";

import { Calculator, Plus, RotateCcw, Trash2, Undo2 } from "lucide-react";

import CountUp from "@/components/CountUp";
import { EmptyState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCgpaCalculator } from "@/hooks/use-cgpa-calculator";
import { CGPA_GRADES, MAX_CREDITS, cgpaSummary, type CgpaGrade } from "@/lib/student/cgpa";

const CREDIT_OPTIONS = Array.from({ length: MAX_CREDITS + 1 }, (_, n) => n);

/** Work out an SGPA from grades you expect - seeded with your courses. */
export function CgpaView() {
  const calc = useCgpaCalculator();
  const summary = cgpaSummary(calc.subjects);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="CGPA calculator"
        description="Pick the grade you expect in each subject."
        actions={
          <>
            <Button variant="outline" size="touch" onClick={calc.undo} disabled={!calc.canUndo}>
              <Undo2 aria-hidden /> Undo
            </Button>
            <Button variant="ghost" size="touch" onClick={calc.reset}>
              <RotateCcw aria-hidden /> Reset
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-4">
          <dt className="text-sm font-semibold text-on-surface-muted">Credits</dt>
          <dd className="font-heading text-stat font-extrabold text-on-surface tabular"><CountUp to={summary.credits} duration={0.5} /></dd>
        </div>
        <div className="rounded-2xl border border-primary/40 bg-primary-container p-4">
          <dt className="text-sm font-semibold text-on-primary-container/80">SGPA</dt>
          <dd className="font-heading text-stat font-extrabold text-on-primary-container tabular" aria-live="polite">
            {summary.sgpa.toFixed(2)}
          </dd>
        </div>
      </dl>

      {!calc.ready ? (
        <ShimmerBlock className="h-64" />
      ) : calc.subjects.length === 0 ? (
        <EmptyState icon={Calculator} title="No subjects yet" description="Add one to work out your SGPA." />
      ) : (
        <ul className="flex flex-col gap-2">
          {calc.subjects.map((subject) => (
            <li key={subject.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container p-3 sm:grid-cols-[1fr_7rem_7rem_auto]">
              <Input
                value={subject.name}
                onChange={(event) => calc.update(subject.id, { name: event.target.value })}
                placeholder="Subject name"
                aria-label="Subject name"
                className="col-span-2 h-11 rounded-xl border-transparent bg-surface-high font-semibold sm:col-span-1"
              />
              <Select value={String(subject.credits)} onValueChange={(value) => calc.update(subject.id, { credits: Number(value) })}>
                <SelectTrigger aria-label="Credits" className="h-11 w-full rounded-xl bg-surface-high">
                  <SelectValue>{(value: string) => `${value} credits`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n} credits</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={subject.grade} onValueChange={(value) => calc.update(subject.id, { grade: value as CgpaGrade })}>
                <SelectTrigger aria-label="Grade" className="h-11 w-full rounded-xl bg-surface-high font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CGPA_GRADES.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon-touch" onClick={() => calc.remove(subject.id)} aria-label={`Remove ${subject.name || "subject"}`} className="text-on-surface-muted hover:text-danger-accent">
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="touch" onClick={() => calc.add()}>
          <Plus aria-hidden /> Add subject
        </Button>
        {calc.missingCourses.map((course) => (
          <Button key={course.id} variant="outline" size="touch" onClick={() => calc.add({ name: course.name, credits: course.credits, grade: "O" })}>
            <Plus aria-hidden /> {course.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
