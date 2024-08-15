"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
import Navbar from "@/components/global/navbar";
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
  const navMenu = [
    {
      name: "Dashboard",
      link: "/student",
      icon: "/icons/home/primary.svg",
    },
    {
      name: "Attendance",
      link: "/student/events",
      icon: "/icons/percent/primary.svg",
    },
    {
      name: "Marks",
      link: "/student/attendance",
      icon: "/icons/bar-chart/primary.svg",
    },
    {
      name: "Planner",
      link: "/student/attendance",
      icon: "/icons/loader/primary.svg",
    },
  ];
  return (
    <>
      <div className="max-h-screen overflow-auto">
        <Navbar items={navMenu} />
        <main className="px-4">
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
        </main>
      </div>
    </>
  );
};

export default Events;
