"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
import Navbar from "@/components/global/navbar";
import Loader from "@/components/global/loader";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";
import {
  pageNames,
  studentPageLink,
} from "@/components/global/navbar/page-link";
import { useRouter } from "next/navigation";
import { baseURL } from "@/constants/baseURL";
import FloatingNavbar from "@/components/global/floatingNavbar";

const Events = () => {
  const router = useRouter();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentID, setStudentID] = useState("");

  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    } else {
      const student = JSON.parse(localStorage.getItem("studentData"));
      setStudentID(student.registrationNumber);
      const requestOptions = {
        method: "GET",
        redirect: "follow",
        cache: "no-cache",
      };

      fetch(`${baseURL}/api/users/allevent`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          setEventData(result.data);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const extractStartDate = (dateRange) => {
    return dateRange.split(" to ")[0];
  };

  const extractEndDate = (dateRange) => {
    return dateRange.split(" to ")[1];
  };

  {
    /*const sortedEvents = eventData?.events?.sort((a, b) => {
    if (a.club_name == "The Campus Web") return -1;
    if (b.club_name == "The Campus Web") return 1;
    const dateA = new Date(extractStartDate(a.dates));
    const dateB = new Date(extractStartDate(b.dates));
    return dateB - dateA;
  });*/
  }

  const sortEventsByDate = (events) => {
    const currentDate = new Date();

    return events?.sort((a, b) => {
      const dateA = new Date(extractStartDate(a?.dates));
      const dateB = new Date(extractStartDate(b?.dates));

      // Calculate absolute difference from current date
      const diffA = Math.abs(currentDate - dateA);
      const diffB = Math.abs(currentDate - dateB);

      return diffA - diffB;
    });
  };

  const sortedEvents = sortEventsByDate(eventData?.events);

  const [eventStatusFilter, setEventStatusFilter] = useState("Upcoming");

  const [eventQuery, setEventQuery] = useState("");
  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Events")} />
        <FloatingNavbar />
        <main className="px-4">
          <SectionTitle title="Events" icon={"/icons/event/secondary.svg"} />
          <form className="mb-5 flex gap-2 items-center theme_box_bg w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              className="ml-2"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#91c3e7"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            <input
              type="text"
              className="bg-transparent py-4 rounded-lg w-full text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-base placeholder:font-medium placeholder:tracking-wide shadow-xl focus:outline-none"
              placeholder="Search"
              name="Search"
              value={eventQuery && eventQuery}
              onChange={(e) => setEventQuery(e.target.value)}
            />
            <button
              className={`mr-2 + ${eventQuery ? "" : "hidden"}`}
              onClick={(e) => {
                e.preventDefault();
                setEventQuery("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#91c3e7"
              >
                <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>
            </button>
          </form>
          {sortedEvents && (
            <div className="flex flex-row justify-start items-center gap-3 pb-4">
              {["Upcoming", "Ongoing", "Past", "All"].map((item, index) => (
                <button
                  className={`${
                    eventStatusFilter == item
                      ? "bg-theme_primary text-theme_text_normal"
                      : "theme_box_bg text-theme_text_normal_60"
                  } px-[14px] py-[3px] text-sm font-normal rounded-full tracking-wide`}
                  key={index}
                  onClick={() => setEventStatusFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 pb-4">
              {sortedEvents ? (
                sortedEvents
                  .filter((event) => {
                    if (eventQuery === "") return event;
                    else if (
                      event.title
                        .toLowerCase()
                        .includes(eventQuery.toLowerCase()) ||
                      event.club_name
                        .toLowerCase()
                        .includes(eventQuery.toLowerCase()) ||
                      event.labels.some((label) =>
                        label.toLowerCase().includes(eventQuery.toLowerCase())
                      ) ||
                      event.dates
                        .toLowerCase()
                        .includes(eventQuery.toLowerCase())
                    )
                      return event;
                  })
                  .filter((event) => {
                    if (eventStatusFilter === "All") return event;
                    else if (eventStatusFilter === "Upcoming") {
                      return (
                        new Date(extractStartDate(event.dates)) >= new Date() ||
                        event.club_name == "The Campus Web"
                      );
                    } else if (eventStatusFilter === "Ongoing") {
                      return (
                        (new Date(extractStartDate(event.dates)) <=
                          new Date() &&
                          new Date(extractEndDate(event.dates)) >=
                            new Date()) ||
                        event.club_name == "The Campus Web"
                      );
                    } else if (eventStatusFilter === "Past") {
                      return (
                        new Date(extractEndDate(event.dates)) < new Date() ||
                        event.club_name == "The Campus Web"
                      );
                    }
                  })
                  .map((event, index) => (
                    <EventCard
                      key={index + event.id}
                      event={event}
                      club={{ name: event.club_name, logo: event.logo }}
                      eventID={event.id}
                      checkLiked={
                        event.likedby
                          ? event.likedby.includes(studentID)
                          : false
                      }
                      flaggedHidden={true}
                    />
                  ))
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    Failed to load Events
                  </span>
                </div>
              )}
              {eventData?.events?.length === 0 && (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    Events Coming Soon...
                  </span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Events;
