/** Mess menu selection: today's (or tomorrow's) meal, and its dishes. */

import {
  MEALS,
  MEAL_SWITCH_MINUTES,
  MESSES,
  WEEKDAYS,
  type Meal,
  type MessId,
  type Weekday,
} from "@/constants/mess";

export interface MealSelection {
  weekday: Weekday;
  meal: Meal;
  /** True when it is past 21:00 and tomorrow's breakfast is shown. */
  isTomorrow: boolean;
}

/** JS getDay() is 0 = Sunday; the menus start on Monday. */
const weekdayOf = (date: Date): Weekday => WEEKDAYS[(date.getDay() + 6) % 7];

export function currentMealSelection(now: Date): MealSelection {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= MEAL_SWITCH_MINUTES.nextDayBreakfast) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return { weekday: weekdayOf(tomorrow), meal: "Breakfast", isTomorrow: true };
  }
  const meal: Meal =
    minutes < MEAL_SWITCH_MINUTES.lunch
      ? "Breakfast"
      : minutes < MEAL_SWITCH_MINUTES.snacks
        ? "Lunch"
        : minutes < MEAL_SWITCH_MINUTES.dinner
          ? "Snacks"
          : "Dinner";
  return { weekday: weekdayOf(now), meal, isTomorrow: false };
}

export function dishesFor(messId: MessId, weekday: Weekday, meal: Meal): string[] {
  const mess = MESSES.find((option) => option.id === messId);
  const raw = mess?.menu.data[0]?.[weekday]?.[meal] ?? "";
  return raw
    .split(",")
    .map((dish) => dish.trim())
    .filter(Boolean);
}

export const isMeal = (value: unknown): value is Meal =>
  MEALS.includes(value as Meal);
export const isWeekday = (value: unknown): value is Weekday =>
  WEEKDAYS.includes(value as Weekday);
export const isMessId = (value: unknown): value is MessId =>
  MESSES.some((mess) => mess.id === value);
