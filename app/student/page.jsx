"use client";

import { useRouter } from "next/navigation";
import EventCarousel from "@/components/global/events/carousel";
import { useState } from "react";

const Student = () => {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(4);
  const [showMore, setShowMore] = useState(false);
  const studentMenu = [
    {
      name: "Attendance",
      icon: "/icons/percent/primary.svg",
      link: "/student/attendance",
    },
    {
      name: "Timetable",
      icon: "/icons/clock/primary.svg",
      link: "/student/timetable",
    },
    {
      name: "Marks",
      icon: "/icons/bar-chart/primary.svg",
      link: "/student/attendance",
    },
    {
      name: "Planner",
      icon: "/icons/loader/primary.svg",
      link: "/student/attendance",
    },
    {
      name: "Events",
      icon: "/icons/calender/primary.svg",
      link: "/student/events",
    },
    {
      name: "Clubs",
      icon: "/icons/users/primary.svg",
      link: "/student/clubs",
    },
  ];
  return (
    <>
      <div className="pt-4">
        <div className="py-5">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <div className="sm:hidden px-2">
          <div className="grid grid-cols-2 justify-center gap-2 mt-8">
            {studentMenu.slice(0, itemCount).map((menu, index) => (
              <button
                key={index}
                onClick={() => router.push(menu.link)}
                className="theme_box_bg py-6 px-4 flex justify-between items-center"
              >
                <span className="text-lg text-white font-medium">
                  {menu.name}
                </span>
                <img src={menu.icon} alt={menu.name} className="h-6 w-6" />
              </button>
            ))}
          </div>
          {showMore ? (
            <button
              className="theme_box_bg py-2 w-full flex justify-center items-center mt-2"
              onClick={() => {
                setItemCount(4);
                setShowMore(false);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#0094FF"
              >
                <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
              </svg>
            </button>
          ) : (
            <button
              className="theme_box_bg py-2 w-full flex justify-center items-center mt-2"
              onClick={() => {
                setItemCount(studentMenu.length);
                setShowMore(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#0094FF"
              >
                <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
              </svg>
            </button>
          )}
          <EventCarousel />
        </div>
      </div>
    </>
  );
};

export default Student;
