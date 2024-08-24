"use client";

import { useRouter } from "next/navigation";
import EventCarousel from "@/components/global/events/carousel";
import { useState } from "react";
import YourStats from "@/components/student/stats";
import Cookies from "js-cookie";
import { studentPageLink } from "@/components/global/navbar/page-link";

const Student = () => {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(4);
  const [showMore, setShowMore] = useState(false);

  const sessionLogout = (e) => {
    e.preventDefault();
    Cookies.remove("studentAuth");
    router.push("/");
    localStorage.clear();
  };
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
        <div className="sm:hidden px-[10px]">
          <div className="flex justify-end">
            <button
              className="flex items-center gap-2 text-theme_text_primary text-lg py-2 font-mono font-semibold"
              onClick={sessionLogout}
              type="button"
              title="Logout"
            >
              Logout
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#91C3E7"
              >
                <path d="M206.78-100.78q-44.3 0-75.15-30.85-30.85-30.85-30.85-75.15v-546.44q0-44.3 30.85-75.15 30.85-30.85 75.15-30.85h277.74v106H206.78v546.44h277.74v106H206.78Zm425.87-152.09L559-328.39 657.61-427H355.48v-106h302.13L559-631.61l73.65-75.52L859.22-480 632.65-252.87Z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 justify-center gap-2 mt-2">
            {studentPageLink.filter((ele) => !['Dashboard'].includes(ele.name)).slice(0, itemCount).map((menu, index) => (
              <button
                key={index}
                onClick={() => router.push(menu.link)}
                className="theme_box_bg py-6 px-4 flex justify-between items-center"
              >
                <span className="text-base text-white font-medium">
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
                setItemCount(studentPageLink.filter((ele) => !['Dashboard'].includes(ele.name)).length);
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
          <div>
            <YourStats />
          </div>
        </div>
      </div>
    </>
  );
};

export default Student;
