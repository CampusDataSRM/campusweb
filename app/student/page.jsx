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
    if (!Cookies.get("X-CSRF-Token")) {
      router.push("/client/login/student");
    } else {
      const myHeaders = new Headers();
      myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        mode: "cors",
      };

      fetch("https://campusapi-puce.vercel.app/api/auth/user/", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          setStudentName(result?.name);
          localStorage.removeItem("studentData");
          localStorage.setItem("studentData", result && JSON.stringify(result));
          setCourseData(result?.courses);
          setTestPerformance(result?.testPerformances);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const sessionLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("studentData");
    Cookies.remove("X-CSRF-Token");
    if (Cookies.get("X-CSRF-Token")) {
      console.log("Token not removed");
    } else {
      console.log("Token removed");
      router.push("/client/login/student");
    }
  };
  return (
    <>
      <div className="py-4 max-h-screen overflow-auto">
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
          </div>
          <div className="grid grid-cols-2 justify-center gap-2 mt-2">
            {studentPageLink
              .filter((ele) => !["Dashboard"].includes(ele.name))
              .slice(0, itemCount)
              .map((menu, index) => (
                <button
                  key={index}
                  onClick={
                    menu.name === "Logout"
                      ? sessionLogout
                      : () => router.push(menu.link)
                  }
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
