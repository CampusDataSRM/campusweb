"use client";

import { useRouter } from "next/navigation";
import EventCarousel from "@/components/global/events/carousel";
import { useEffect, useState } from "react";
import YourStats from "@/components/student/stats";
import Cookies from "js-cookie";
import { studentPageLink } from "@/components/global/navbar/page-link";
import DashboardTimetable from "@/components/student/timetable/dashboard";
import { toTitleCase } from "@/functions/title-case-convert";

const Student = () => {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(4);
  const [studentName, setStudentName] = useState(". . .");
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const [courseData, setCourseData] = useState([]);
  const [testPerformance, setTestPerformance] = useState([]);

  useEffect(() => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));
    myHeaders.append("mode", "cors");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/auth/user/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setStudentName(result?.name);
        localStorage.setItem("studentData", result && JSON.stringify(result));
        setCourseData(result?.courses);
        setTestPerformance(result?.testPerformances);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

  const sessionLogout = (e) => {
    e.preventDefault();
    Cookies.remove("X-CSRF-Token");
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
          <div className="flex justify-between items-center px-1 mt-3">
            <div className="flex gap-2 items-center">
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${
                  loading ? "bg-theme_red" : "bg-theme_green"
                }`}
              ></span>
              <div>
                {loading ? (
                  <div className="flex justify-center">
                    <span className="circle animate-loader"></span>
                    <span className="circle animate-loader animation-delay-200"></span>
                    <span className="circle animate-loader animation-delay-400"></span>
                  </div>
                ) : (
                  <span className="text-base font-normal tracking-widest text-theme_text_normal">
                    {toTitleCase(studentName)}
                  </span>
                )}
              </div>
            </div>
            <button
              className="flex items-center gap-2 text-theme_text_primary text-lg py-2 font-mono font-semibold"
              onClick={sessionLogout}
              type="button"
              title="Logout"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#91c3e7"
              >
                <path d="M480-48q-89.64 0-168.48-34.02-78.84-34.02-137.16-92.34-58.32-58.32-92.34-137.16T48-480q0-90.6 33.5-168.8Q115-727 174-786l75 75q-44.95 44.55-69.97 103.28Q154-549 154-480.33 154-343 248.74-248.5 343.49-154 480-154t231.26-94.74Q806-343.49 806-480q0-69-25.03-127.72Q755.95-666.45 711-711l75-75q59 59 92.5 137.2Q912-570.6 912-480q0 89.52-33.5 168.26t-91.99 137.16q-58.48 58.42-137.55 92.5Q569.9-48 480-48Zm-53-379v-485h106v485H427Z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 justify-center gap-2 mt-2">
            {studentPageLink
              .filter((ele) => !["Dashboard"].includes(ele.name))
              .slice(0, itemCount)
              .map((menu, index) => (
                <button
                  key={index}
                  onClick={(menu.name === 'Logout') ? sessionLogout : () => router.push(menu.link)}
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
                setItemCount(
                  studentPageLink.filter(
                    (ele) => !["Dashboard"].includes(ele.name)
                  ).length
                );
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

          {!loading && (
            <div className="mt-4">
              <DashboardTimetable />
            </div>
          )}
          <div>
            <YourStats
              courseData={courseData}
              testPerformance={testPerformance}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Student;
