"use client";
import EventCard from "@/components/global/events/event-card";
import { useEffect, useState } from "react";
import Navbar from "@/components/global/navbar";
import Loader from "@/components/global/loader";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";
import { pageNames, studentPageLink } from "@/components/global/navbar/page-link";

const Events = () => {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentID, setStudentID] = useState("");
  const [clickedOnLike, setClickedOnLike] = useState(false);
  const [processLike, setProcessLike] = useState(false);

  const likeEvent = (eventID) => {
    setClickedOnLike(true);
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));
    myHeaders.append("eventid", eventID);

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/users/post-p", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if(result.message == "Popularity updated successfully") {
        setClickedOnLike(false);
        setProcessLike(!processLike);
        } else {
          alert("Something went wrong");
          clickedOnLike(false);
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    setLoading(true);
    const student = JSON.parse(localStorage.getItem("studentData"));
    setStudentID(student.registrationNumber);
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
  }, [processLike]);

  const [eventQuery, setEventQuery] = useState("");
  return (
    <>
      <div className="max-h-screen overflow-auto">
        <Navbar items={pageNames.filter(item => item !== "Events")} />
        <main className="px-4">
          <SectionTitle title="Events" icon={"/icons/calender/secondary.svg"} />
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
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 pb-4">
              {eventData?.events ? (
                eventData?.events
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
                  .slice(0)
                  .reverse()
                  .map((event, index) => (
                    <EventCard
                      key={index}
                      event={event}
                      club={{ name: event.club_name, logo: event.logo }}
                      onLikingEvent={() => likeEvent(event.id)}
                      checkLiked={
                        event.likedby
                          ? event.likedby.includes(studentID)
                          : false
                      }
                      userClickedLiked={clickedOnLike}
                    />
                  ))
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    No Events to Showcase
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
