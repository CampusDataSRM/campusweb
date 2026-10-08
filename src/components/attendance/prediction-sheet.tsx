"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AttendanceTrack } from "@/components/ui/attendance-track";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import type { AttendancePredictionState } from "@/hooks/use-attendance-prediction";
import { usePlanner } from "@/hooks/use-student-data";
import {
  countBelowThreshold,
  courseAttendance,
  overallAttendance,
} from "@/lib/student/attendance";
import {
  parseDayOrder,
  plannerDayFor,
  plannerMonths,
  plannerRange,
} from "@/lib/student/planner";
import { notify } from "@/lib/toast";
import styles from "./prediction-sheet.module.css";

type Mode = "missed" | "credited";
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});
const longDateFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});
const QUICK_PICKS = [
  { label: "Today", days: (t: Date) => [t] },
  { label: "Tomorrow", days: (t: Date) => [addDays(t, 1)] },
  {
    label: "Next 3 days",
    days: (t: Date) => [0, 1, 2].map((n) => addDays(t, n)),
  },
  {
    label: "Rest of week",
    days: (t: Date) =>
      Array.from({ length: Math.max(1, 6 - ((t.getDay() + 6) % 7)) }, (_, n) =>
        addDays(t, n),
      ),
  },
];
const MESSAGES = {
  "no-classes": "No classes are scheduled on the selected days.",
  "no-dates": "Choose at least one day.",
  "past-dates": "Days you'll miss must be today or later.",
} as const;

export function PredictionSheet({
  open,
  onOpenChange,
  prediction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prediction: AttendancePredictionState;
}) {
  const planner = usePlanner();
  const today = useMemo(() => startOfDay(new Date()), []);
  const months = useMemo(() => plannerMonths(planner.data), [planner.data]);
  const range = useMemo(() => plannerRange(months), [months]);
  const [mode, setMode] = useState<Mode>("missed");
  const [missed, setMissed] = useState<Date[]>(() =>
    prediction.missed.filter(
      (date) =>
        !prediction.credited.some(
          (other) => other.getTime() === date.getTime(),
        ),
    ),
  );
  const [credited, setCredited] = useState<Date[]>(prediction.credited);
  const [month, setMonth] = useState(prediction.missed[0] ?? today);
  const selected = mode === "missed" ? missed : credited;
  const earliest = mode === "missed" ? today : (range?.start ?? today);
  const latest = range?.end ?? addDays(today, 60);
  const dates = [
    ...missed.map((date) => ({ date, mode: "missed" as const })),
    ...credited.map((date) => ({ date, mode: "credited" as const })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  const draft = prediction.preview(missed, credited);
  const result = draft && typeof draft === "object" ? draft : null;
  const clearing =
    dates.length === 0 &&
    (prediction.missed.length > 0 || prediction.credited.length > 0);
  const canApply = clearing || (!!result && result.selectedClassCount > 0);
  const courses = result?.courses ?? prediction.baseCourses;
  const current = overallAttendance(prediction.baseCourses);
  const projected = overallAttendance(courses);
  const below = countBelowThreshold(courses);
  const last = dates.at(-1)?.date;
  const noClasses = !!result && result.selectedClassCount === 0;
  const impactRef = useRef<HTMLElement>(null);

  // A day has one intent. Switching it to OD/ML removes it from missed days.
  const select = (days: Date[]) => {
    const keys = new Set(days.map((date) => date.getTime()));
    if (mode === "missed") {
      setMissed(days);
      setCredited((old) => old.filter((date) => !keys.has(date.getTime())));
    } else {
      setCredited(days);
      setMissed((old) => old.filter((date) => !keys.has(date.getTime())));
    }
  };
  const apply = () => {
    if (clearing) {
      prediction.clear();
      notify.success("Prediction cleared");
      onOpenChange(false);
      return;
    }
    const outcome = prediction.apply(missed, credited);
    if (outcome === "ok") {
      notify.success("Prediction applied");
      onOpenChange(false);
    } else notify.error(MESSAGES[outcome]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader className={styles.header}>
          <span className={styles.eyebrow}>
            <CalendarDays aria-hidden size={14} /> YOUR ATTENDANCE, PLANNED
          </span>
          <DialogTitle className={styles.title}>
            Plan your next few days.
          </DialogTitle>
          <DialogDescription className={styles.description}>
            Pick your days. See what changes before you decide.
          </DialogDescription>
        </DialogHeader>
        <div className={styles.workspace}>
          <section className={styles.selection} aria-label="Choose days">
            <Segmented
              label="Day type"
              value={mode}
              onChange={setMode}
              stretch
              className={styles.modes}
              options={[
                {
                  value: "missed",
                  label: (
                    <>
                      Days I’ll miss{" "}
                      <span className={styles.count}>{missed.length}</span>
                    </>
                  ),
                },
                {
                  value: "credited",
                  label: (
                    <>
                      OD / ML{" "}
                      <span className={styles.count}>{credited.length}</span>
                    </>
                  ),
                },
              ]}
            />
            <p className={styles.hint}>
              {mode === "missed"
                ? "Tap dates you’ll be away. Tap again to remove them."
                : "Select days covered by OD or medical leave. They count as present."}
            </p>
            {mode === "missed" && (
              <div
                className={styles.quickPicks}
                aria-label="Quick date selections"
              >
                {QUICK_PICKS.map((pick) => (
                  <button
                    type="button"
                    key={pick.label}
                    onClick={() => {
                      const days = pick
                        .days(today)
                        .filter((date) => date >= earliest && date <= latest);
                      select(days);
                      if (days[0]) setMonth(days[0]);
                    }}
                  >
                    {pick.label}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.calendarWrap} data-mode={mode}>
              <Calendar
                mode="multiple"
                selected={selected}
                onSelect={(days) => select(days ?? [])}
                month={month}
                onMonthChange={setMonth}
                weekStartsOn={1}
                startMonth={earliest}
                endMonth={latest}
                disabled={[{ before: earliest }, { after: latest }]}
                modifiers={{
                  noClasses: (date) => {
                    const entry = plannerDayFor(months, date);
                    return !!entry && parseDayOrder(entry.Dayorder) === null;
                  },
                  missed,
                  credited,
                }}
                modifiersClassNames={{
                  noClasses: styles.noClasses,
                  missed: styles.missedDay,
                  credited: styles.creditedDay,
                }}
                className={styles.calendar}
              />
            </div>
            <div className={styles.legend}>
              <span>
                <i data-tone="missed" /> Missed
              </span>
              <span>
                <i data-tone="credited" /> OD / ML
              </span>
              <span>
                <i data-tone="free" /> No classes
              </span>
            </div>
            <div className={styles.datesHeading}>
              <h3>Your selected days</h3>
              <span>{dates.length}</span>
            </div>
            {dates.length === 0 ? (
              <p className={styles.emptyDates}>
                Start with a date or a quick pick above.
              </p>
            ) : (
              <div className={styles.dates}>
                {dates.map(({ date, mode: type }) => (
                  <button
                    type="button"
                    key={date.getTime()}
                    data-tone={type}
                    aria-label={`Remove ${longDateFormat.format(date)} from ${type === "missed" ? "missed days" : "OD / ML"}`}
                    onClick={() =>
                      (type === "missed" ? setMissed : setCredited)((old) =>
                        old.filter((item) => item.getTime() !== date.getTime()),
                      )
                    }
                  >
                    {dateFormat.format(date)}{" "}
                    <span>{type === "missed" ? "Miss" : "OD / ML"}</span>
                    <X aria-hidden size={12} />
                  </button>
                ))}
              </div>
            )}
          </section>
          <section
            className={styles.impact}
            aria-label="Attendance forecast"
            ref={impactRef}
          >
            <div className={styles.impactHeading}>
              <span className={styles.eyebrow}>THE IMPACT</span>
              <span className={styles.live}>
                <i /> Live preview
              </span>
            </div>
            <h3>
              {dates.length ? "Here’s how it looks." : "Where you stand today."}
            </h3>
            <div
              className={styles.overall}
              aria-live="polite"
              aria-atomic="true"
            >
              <div>
                <span>Now</span>
                <strong>
                  {current.toFixed(1)}
                  <small>%</small>
                </strong>
              </div>
              <ArrowRight aria-hidden size={20} />
              <div data-tone={projected < 75 ? "risk" : "safe"}>
                <span>{dates.length ? "Projected" : "Your attendance"}</span>
                <strong>
                  {projected.toFixed(1)}
                  <small>%</small>
                </strong>
              </div>
            </div>
            <p className={styles.assumption}>
              {last
                ? `Through ${dateFormat.format(last)} · assumes you attend every other scheduled class.`
                : "Select dates to see your projected attendance for every subject."}
            </p>
            <div className={styles.stats}>
              <div>
                <strong>{result?.missedClassCount ?? 0}</strong>
                <span>classes missed</span>
              </div>
              <div>
                <strong>{below}</strong>
                <span>subjects below 75%</span>
              </div>
            </div>
            {!prediction.ready && (
              <p className={styles.notice} role="status">
                Loading your planner and timetable. Your preview will appear
                here.
              </p>
            )}
            {noClasses && (
              <p className={styles.notice} role="status">
                No classes on these dates. Try another day.
              </p>
            )}
            {typeof draft === "string" && draft === "past-dates" && (
              <p className={styles.notice} role="status">
                {MESSAGES[draft]}
              </p>
            )}
            <div className={styles.courseHeader}>
              <h4>Subject forecast</h4>
              <span>Now → projected</span>
            </div>
            <ul className={styles.courses}>
              {courses.map((course, index) => {
                const before = courseAttendance(prediction.baseCourses[index]);
                const after = courseAttendance(course);
                return (
                  <li
                    key={`${course.courseCode}-${index}`}
                    data-tone={after.isBelowThreshold ? "risk" : "safe"}
                  >
                    <div className={styles.courseTop}>
                      <span>{course.courseTitle}</span>
                      <span className={styles.percent}>
                        <small>{before.percent.toFixed(1)}%</small>
                        <ArrowRight aria-hidden size={12} />
                        <strong>{after.percent.toFixed(1)}%</strong>
                      </span>
                    </div>
                    <div className={styles.track}>
                      <AttendanceTrack
                        value={after.percent}
                        tone={after.isBelowThreshold ? "danger" : "success"}
                        label={false}
                      />
                    </div>
                    <p>
                      {after.isPending
                        ? "No classes held yet"
                        : after.required > 0
                          ? `Attend ${after.required} more ${after.required === 1 ? "class" : "classes"} to reach 75%`
                          : after.margin === 0
                            ? "At the limit · attend the next class"
                            : `${after.margin} ${after.margin === 1 ? "class" : "classes"} of room above 75%`}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.mobileForecast}
            onClick={() =>
              impactRef.current?.scrollIntoView({ block: "start" })
            }
          >
            <span>
              Projected <strong>{projected.toFixed(1)}%</strong>
            </span>
            <span>
              View forecast <ArrowRight aria-hidden size={13} />
            </span>
          </button>
          <p>
            <ShieldCheck aria-hidden size={16} />
            <span>
              Only a forecast.
              <br />
              <small>
                OD / ML is saved on this device; official records stay
                unchanged.
              </small>
            </span>
          </p>
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="touch"
              onClick={() => {
                setMissed([]);
                setCredited([]);
              }}
              disabled={dates.length === 0}
            >
              <RotateCcw aria-hidden /> Reset
            </Button>
            <Button
              size="touch"
              className={styles.apply}
              disabled={!prediction.ready || !canApply}
              onClick={apply}
            >
              <Check aria-hidden />{" "}
              {clearing ? "Clear preview" : "Apply preview"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
