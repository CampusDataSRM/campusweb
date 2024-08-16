"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
import Navbar from "@/components/global/navbar";
import Loader from "@/components/global/loader";
import SectionTitle from "@/components/global/section-title";

const Events = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/users/allevent",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setEventData(result.data);
        setLoading(false);
      })
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
          <SectionTitle title="Events" icon={"/icons/calender/secondary.svg"} />
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 py-4 mt-2">
              {eventData.events &&
                eventData.events.map((event, index) => (
                  <EventCard key={index} event={event} club={event.club} />
                ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Events;
