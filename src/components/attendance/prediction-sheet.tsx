"use client";

import { CalendarRange, Eraser, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { AttendancePredictionState } from "@/hooks/use-attendance-prediction";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlanner } from "@/hooks/use-student-data";
import { plannerMonths, plannerRange } from "@/lib/student/planner";
import { notify } from "@/lib/toast";

type Mode = "missed" | "credited";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const QUICK_PICKS: ReadonlyArray<{ label: string; days: (today: Date) => Date[] }> = [
  { label: "Today", days: (t) => [t] },
  { label: "Tomorrow", days: (t) => [addDays(t, 1)] },
  { label: "Next 3 days", days: (t) => [0, 1, 2].map((n) => addDays(t, n)) },
  {
    label: "Rest of week",
    days: (t) => Array.from({ length: Math.max(1, 6 - ((t.getDay() + 6) % 7)) }, (_, n) => addDays(t, n)),
  },
];

const MESSAGES = {
  "no-classes": "No classes are scheduled on the selected days.",
  "no-dates": "Choose at least one day.",
  "past-dates": "Days you'll miss must be today or later.",
} as const;

const rangeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

export function PredictionSheet({
  open,
  onOpenChange,
  prediction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prediction: AttendancePredictionState;
}) {
  const isMobile = useIsMobile();
  const planner = usePlanner();
  const today = useMemo(() => startOfDay(new Date()), []);
  const range = useMemo(() => plannerRange(plannerMonths(planner.data)), [planner.data]);
  const [mode, setMode] = useState<Mode>("missed");
  const [missed, setMissed] = useState<Date[]>(prediction.missed);
  const [credited, setCredited] = useState<Date[]>(prediction.credited);

  const selected = mode === "missed" ? missed : credited;
  const setSelected = mode === "missed" ? setMissed : setCredited;
  const earliest = mode === "missed" ? today : (range?.start ?? today);
  const latest = range?.end ?? addDays(today, 60);

  const sorted = [...selected].sort((a, b) => a.getTime() - b.getTime());
  const summary =
    sorted.length === 0
      ? mode === "missed"
        ? "Pick the days you expect to miss."
        : "Pick days covered by OD or ML - they count as present."
      : `${sorted.length} day${sorted.length === 1 ? "" : "s"} · ${rangeFormat.format(sorted[0])}${sorted.length > 1 ? ` - ${rangeFormat.format(sorted[sorted.length - 1])}` : ""}`;

  const apply = () => {
    const outcome = prediction.apply(missed, credited);
    if (outcome === "ok") {
      notify.success("Prediction applied");
      onOpenChange(false);
    } else {
      notify.error(MESSAGES[outcome]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className="flex max-h-[92dvh] flex-col gap-0 border-outline-variant bg-surface-container data-[side=bottom]:rounded-t-3xl sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-heading text-h3 text-on-surface">
            <Sparkles aria-hidden className="size-5 text-secondary-accent" /> Predict attendance
          </SheetTitle>
          <SheetDescription className="text-on-surface-muted">
            Plan missed days and add OD/ML credit. Nothing is sent anywhere.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <ToggleGroup
            value={[mode]}
            onValueChange={(value) => value[0] && setMode(value[0] as Mode)}
            className="grid w-full grid-cols-2 rounded-xl bg-surface-highest p-1"
          >
            <ToggleGroupItem value="missed" className="h-10 rounded-lg font-semibold data-[pressed]:bg-primary data-[pressed]:text-on-primary">
              Days I&apos;ll miss {missed.length > 0 && `(${missed.length})`}
            </ToggleGroupItem>
            <ToggleGroupItem value="credited" className="h-10 rounded-lg font-semibold data-[pressed]:bg-secondary data-[pressed]:text-on-secondary">
              OD / ML {credited.length > 0 && `(${credited.length})`}
            </ToggleGroupItem>
          </ToggleGroup>

          {mode === "missed" && (
            <div className="flex flex-wrap gap-2">
              {QUICK_PICKS.map((pick) => (
                <Button key={pick.label} variant="outline" size="sm" className="rounded-full" onClick={() => setMissed(pick.days(today))}>
                  {pick.label}
                </Button>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-outline-variant bg-surface-high p-2">
            <Calendar
              mode="multiple"
              selected={selected}
              onSelect={(days) => setSelected(days ?? [])}
              weekStartsOn={1}
              startMonth={earliest}
              endMonth={latest}
              defaultMonth={mode === "missed" ? today : (sorted[0] ?? today)}
              disabled={[{ before: earliest }, { after: latest }]}
              className="mx-auto w-full [--cell-size:2.6rem]"
            />
          </div>

          <p className="flex items-center gap-2 text-sm text-on-surface-muted" aria-live="polite">
            <CalendarRange aria-hidden className="size-4 shrink-0" /> {summary}
          </p>
          {!prediction.ready && (
            <p className="text-sm text-warning-accent">Planner or timetable is still loading - try again in a moment.</p>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-outline-variant">
          <Button variant="ghost" size="touch" onClick={() => { setMissed([]); setCredited([]); }}>
            <Eraser aria-hidden /> Clear
          </Button>
          <Button size="touch" className="flex-1" disabled={!prediction.ready || (missed.length === 0 && credited.length === 0)} onClick={apply}>
            Preview {missed.length + credited.length || ""} day{missed.length + credited.length === 1 ? "" : "s"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
