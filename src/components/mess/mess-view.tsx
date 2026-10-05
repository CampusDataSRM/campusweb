"use client";

import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Segmented } from "@/components/ui/segmented";
import {
  MEALS,
  MEAL_TIMES,
  MESSES,
  WEEKDAYS,
  type Meal,
  type MessId,
  type Weekday,
} from "@/constants/mess";
import { useNow } from "@/hooks/use-now";
import { usePreferredMess } from "@/hooks/use-preferred-mess";
import { currentMealSelection, dishesFor } from "@/lib/student/mess";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** The mess menu: today's current meal by default, any day and meal on demand. */
export function MessView() {
  const now = useNow();
  const { mess, loaded, choose } = usePreferredMess();
  const [weekday, setWeekday] = useState<Weekday | null>(null);
  const [meal, setMeal] = useState<Meal | null>(null);

  if (!loaded || !now) return <ShimmerBlock className="h-96" />;

  if (!mess) {
    return (
      <div className="campus-view mess-page flex flex-col gap-6">
        <PageHeader
          title="What's in mess"
          description="Choose your mess - you can change it any time."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MESSES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option.id)}
              className="flex items-center gap-4 rounded-3xl panel spotlight pressable p-6 text-left hover:border-outline"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                <UtensilsCrossed aria-hidden className="size-6" />
              </span>
              <span className="font-heading font-bold text-on-surface">
                {option.name}
              </span>
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
    <div className="campus-view mess-page flex flex-col gap-6">
      <PageHeader
        title="What's in mess"
        description={`${shownMeal} ${isAuto ? (auto.isTomorrow ? "tomorrow" : "today") : `on ${capitalize(day)}`}, served ${MEAL_TIMES[shownMeal]}`}
        actions={
          <Select
            value={mess}
            onValueChange={(value) => choose(value as MessId)}
          >
            <SelectTrigger
              aria-label="Mess"
              className="h-11 rounded-xl bg-surface-container"
            >
              <SelectValue>
                {(value: string) => MESSES.find((m) => m.id === value)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MESSES.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="flex flex-col gap-3">
        <Segmented
          label="Meal"
          value={shownMeal}
          onChange={(value) => setMeal(value)}
          options={MEALS.map((item) => ({ value: item, label: item }))}
          stretch
        />
        <div className="mess-weekdays flex flex-wrap gap-1.5">
          {WEEKDAYS.map((item) => (
            <Button
              key={item}
              variant={item === day ? "tonal" : "outline"}
              size="sm"
              onClick={() => setWeekday(item)}
              aria-pressed={item === day}
              className="min-h-11 flex-1 rounded-lg px-1 text-xs sm:flex-none sm:px-4"
            >
              {capitalize(item).slice(0, 3)}
            </Button>
          ))}
          {!isAuto && (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 rounded-lg"
              onClick={() => {
                setWeekday(null);
                setMeal(null);
              }}
            >
              Back to now
            </Button>
          )}
        </div>
      </div>

      {dishes.length === 0 ? (
        <p className="rounded-2xl panel p-6 text-on-surface-muted">
          No menu published for this meal.
        </p>
      ) : (
        <section className="meal-menu" aria-label={`${shownMeal} menu`}>
          <div className="meal-menu-header">
            <div>
              <h2>{shownMeal}</h2>
              <p>
                {capitalize(day)} · {MEAL_TIMES[shownMeal]}
              </p>
            </div>
            <UtensilsCrossed
              aria-hidden
              className="size-8 text-primary-accent"
            />
          </div>
          <ol>
            {dishes.map((dish, index) => (
              <li key={`${dish}-${index}`}>
                <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                {dish}
              </li>
            ))}
          </ol>
          <p className="campus-caption mt-6">
            {MESSES.find((option) => option.id === mess)?.name}
          </p>
        </section>
      )}
    </div>
  );
}
