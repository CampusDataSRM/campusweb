"use client";

import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MEALS, MEAL_TIMES, MESSES, WEEKDAYS, type Meal, type MessId, type Weekday } from "@/constants/mess";
import { useNow } from "@/hooks/use-now";
import { usePreferredMess } from "@/hooks/use-preferred-mess";
import { currentMealSelection, dishesFor } from "@/lib/student/mess";
import { cn } from "@/lib/utils";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** The mess menu: today's current meal by default, any day and meal on demand. */
export function MessView() {
  const now = useNow();
  const { mess, loaded, choose } = usePreferredMess();
  const [weekday, setWeekday] = useState<Weekday | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);

  if (!loaded || !now) return <ShimmerBlock className="h-96" />;

  if (!mess) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="What's in mess" description="Choose your mess - you can change it any time." />
        <div className="grid gap-3 sm:grid-cols-2">
          {MESSES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              className="flex items-center gap-4 rounded-3xl border border-outline-variant bg-surface-container p-6 text-left transition-colors hover:border-primary hover:bg-surface-high"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                <UtensilsCrossed aria-hidden className="size-6" />
              </span>
              <span className="font-heading font-bold text-on-surface">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const auto = currentMealSelection(now);
  const day = weekday ?? auto.weekday;
  const shownMeal = meal ?? auto.meal;
  const isAuto = weekday === null && meal === null;
  const dishes = dishesFor(mess, day, shownMeal);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="What's in mess"
        description={`${isAuto ? (auto.isTomorrow ? "Tomorrow" : "Today") : capitalize(day)} · ${shownMeal} · ${MEAL_TIMES[shownMeal]}`}
        actions={
          <Select value={mess} onValueChange={(value) => choose(value as MessId)}>
            <SelectTrigger aria-label="Mess" className="h-11 rounded-xl bg-surface-container">
              <SelectValue>{(value: string) => MESSES.find((m) => m.id === value)?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MESSES.map((option) => <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="flex flex-col gap-3">
        <ToggleGroup value={[shownMeal]} onValueChange={(v) => v[0] && setMeal(v[0] as Meal)} aria-label="Meal" className="grid grid-cols-4 gap-1 rounded-2xl border border-outline-variant bg-surface-container p-1.5">
          {MEALS.map((item) => (
            <ToggleGroupItem key={item} value={item} className="h-10 rounded-xl text-sm font-bold data-[pressed]:bg-primary data-[pressed]:text-on-primary">
              {item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="-mx-page flex gap-1.5 overflow-x-auto px-page pb-1 sm:mx-0 sm:px-0">
          {WEEKDAYS.map((item) => (
            <Button
              key={item}
              variant={item === day ? "tonal" : "outline"}
              size="sm"
              onClick={() => setWeekday(item)}
              aria-pressed={item === day}
              className="h-9 shrink-0 rounded-full px-4"
            >
              {capitalize(item).slice(0, 3)}
            </Button>
          ))}
          {!isAuto && (
            <Button variant="ghost" size="sm" className="h-9 shrink-0 rounded-full" onClick={() => { setWeekday(null); setMeal(null); }}>
              Back to now
            </Button>
          )}
        </div>
      </div>

      {dishes.length === 0 ? (
        <p className="rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface-muted">No menu published for this meal.</p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish, index) => (
            <li key={`${dish}-${index}`} className={cn("flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3")}>
              <span className="font-heading text-sm font-extrabold text-on-surface-brand tabular">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-semibold text-on-surface">{dish}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
