import React from "react";
import Image from "next/image";

export default function PrevNextButton({
  currentDay,
  currentMeal,
  setCurrentDay,
  setCurrentMeal,
  isDrawer
}) {
  // const { currentDay, currentMeal, setCurrentDay, setCurrentMeal, isDrawer } = data;

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];


  const setNextMeal = (currentDay, currentMeal) => {
    console.log("next meal")
    if (currentMeal.toLowerCase() === "dinner") {
      setCurrentDay(
        days[(days.indexOf(currentDay.toLowerCase()) + 1) % days.length]
      );
      setCurrentMeal("Breakfast");
    } else {
      setCurrentDay(currentDay),
        setCurrentMeal(meals[(meals.indexOf(currentMeal) + 1) % meals.length]);
    }
  };

  const setPreviousMeal = (currentDay, currentMeal) => {
    if (currentMeal.toLowerCase() === "breakfast") {
      // If the current meal is "Breakfast," we set the previous day and "Dinner."
      const previousDayIndex = (days.indexOf(currentDay.toLowerCase()) - 1 + days.length) % days.length;
      setCurrentDay(days[previousDayIndex]);
      setCurrentMeal("Dinner");
    } else {
      // For all other meals, we set the same day and the previous meal.
      const previousMealIndex = (meals.indexOf(currentMeal) - 1 + meals.length) % meals.length;
      setCurrentDay(currentDay);
      setCurrentMeal(meals[previousMealIndex]);
    }
  };

  return (
    <div className={`fixed bottom-24 right-5 ${isDrawer ? "-z-10" : "z-40"}`}>
  <div className="flex gap-10">
    <Image
      src="/leftArrow.svg"
      alt="admin"
      width={30}
      height={30}
      className="h-fit cursor-pointer"
      onClick={() => setPreviousMeal(currentDay, currentMeal)}
    />
    <Image
      src="/rightArrow.svg"
      alt="admin"
      width={30}
      height={30}
      className="h-fit cursor-pointer"
      onClick={() => setNextMeal(currentDay, currentMeal)}
    />
  </div>
</div>

  );
}
