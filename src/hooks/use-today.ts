"use client";

import { useMemo } from "react";

import { useNow } from "@/hooks/use-now";
import { usePlanner, useTimetable } from "@/hooks/use-student-data";
import { plannerMonths, resolveDayOrder } from "@/lib/student/planner";
import {
  classMoment,
  classesForDay,
  minutesSinceMidnight,
  type ClassMoment,
  type TimetableClass,
} from "@/lib/student/timetable";

export interface Today {
  now: Date | null;
  /** Day order 1-5, or null on a holiday / day without classes. */
  dayOrder: number | null;
  classes: TimetableClass[];
  moment: ClassMoment;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/** Today's day order (from the planner) and classes, ticking each minute. */
export function useToday(): Today {
  const now = useNow();
  const planner = usePlanner();
  const timetable = useTimetable();

  return useMemo(() => {
    const months = plannerMonths(planner.data);
    const dayOrder = now
      ? resolveDayOrder(months, now, timetable.data?.day_order)
      : null;
    const classes = classesForDay(timetable.data?.timetable, dayOrder);
    return {
      now,
      dayOrder,
      classes,
      moment: now ? classMoment(classes, minutesSinceMidnight(now)) : { current: null, next: null },
      isLoading: now === null || timetable.isLoading || planner.isLoading,
      error: timetable.error,
      refetch: () => {
        void timetable.refetch();
        void planner.refetch();
      },
    };
  }, [now, planner, timetable]);
}
