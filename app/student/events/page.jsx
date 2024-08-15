"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
const Events = () => {
  const [eventData, setEventData] = useState([]);
  useEffect(() => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/users/allevent",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => setEventData(result.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <>
      <div className="px-8 z-50 max-h-screen overflow-auto">
        <div className="text-theme_text_primary flex justify-start items-center gap-2 content-center text-xl py-6 font-semibold">
          <span>
            {" "}
            <img
              alt="calender"
              src="/icons/calender/secondary.svg"
              className="w-5"
            />{" "}
          </span>{" "}
          Our Events
        </div>
        <div className="flex flex-wrap justify-center gap-8 py-4 mt-2">
          {eventData.events &&
            eventData.events.map((event, index) => (
              <EventCard key={index} event={event} club={event.club} />
            ))}
        </div>
      </div>
    </>
  );
};

export default Events;
