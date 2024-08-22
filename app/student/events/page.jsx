"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
import Navbar from "@/components/global/navbar";
import Loader from "@/components/global/loader";
import SectionTitle from "@/components/global/section-title";
import { studentPageLink } from "@/components/global/navbar/page-link";

const Events = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      mode: "cors",
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
      name: studentPageLink.dashboard.name,
      link: studentPageLink.dashboard.link,
      icon: studentPageLink.dashboard.icon,
    },
    {
      name: studentPageLink.timetable.name,
      link: studentPageLink.timetable.link,
      icon: studentPageLink.timetable.icon,
    },
    {
      name: studentPageLink.attendance.name,
      link: studentPageLink.attendance.link,
      icon: studentPageLink.attendance.icon,
    },
    {
      name: studentPageLink.clubs.name,
      link: studentPageLink.clubs.link,
      icon: studentPageLink.clubs.icon,
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
              {eventData?.events &&
                eventData?.events.slice(0).reverse().map((event, index) => (
                  <EventCard key={index} event={event} club={{name: event.club_name, logo: event.logo}} />
                ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Events;
