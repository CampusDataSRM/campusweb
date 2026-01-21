"use client";

import { useRouter } from "next/navigation";
import EventCarousel from "@/components/global/events/carousel";
import { useEffect, useState } from "react";
import YourStats from "@/components/student/stats";
import Cookies from "js-cookie";
import { studentPageLink } from "@/components/global/navbar/page-link";
import DashboardTimetable from "@/components/student/timetable/dashboard";
import { toTitleCase } from "@/functions/title-case-convert";
import InstallButton from "@/components/global/InstallButton";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";
import { RWebShare } from "react-web-share";
import FloatingNavbar from "@/components/global/floatingNavbar";
import Banner3to1 from "@/components/sponsorship/Banner3to1";
import { ro } from "date-fns/locale";
import SectionTitle from "@/components/global/section-title";

const Student = () => {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(4);
  const [studentName, setStudentName] = useState(". . .");
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const [courseData, setCourseData] = useState([]);
  const [testPerformance, setTestPerformance] = useState([]);

  const [swapToClub, setSwapToClub] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token")) {
      router.push("/client/login/student");
    } else {
      if (Cookies.get("clubLoggedIn")) {
        setSwapToClub(true);
      }
      if (localStorage.getItem("studentData")) {
        const studentData = JSON.parse(localStorage.getItem("studentData"));
        setStudentName(studentData?.name);
        setCourseData(studentData?.courses);
        setTestPerformance(studentData?.testPerformances);
        setLoading(false);
      }
      if (localStorage.getItem("studentCalendar")) {
        localStorage.removeItem("studentCalendar");
      }
      const myHeaders = new Headers();
      myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));
      myHeaders.append("Content-Type", "application/json");

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        cache: "no-store",
      };

      fetch(`${baseURL}/api/auth/user`, requestOptions)
        .then((response) => {
          if (typeof response === "string") {
            return { name: "John Doe" }; // Temporary fix for string response
          } else if (response.status === 500) {
            return { name: "John Doe" }; // Temporary fix for server error
          } else if (response.status === 429) {
            return "Too many requests";
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch data");
          }
        })
        .then((result) => {
          if (result === "Too many requests") {
            toast.error("Too many requests. Try again in a min.");
          } else if (result === null) {
            router.push("/student/timetable");
          } else {
            setStudentName(result?.name);
            localStorage.setItem(
              "studentData",
              result && JSON.stringify(result)
            );
            setCourseData(result?.courses);
            setTestPerformance(result?.testPerformances);
          }
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }

    // const cookieDate = localStorage.getItem("cookieDate");
    // let dateDifference = 0;
    // if (cookieDate) {
    //   dateDifference = (new Date() - new Date(cookieDate)) / (1000 * 60 * 60 * 24);
    // }
    // if (dateDifference > 25 || !cookieDate) {
    // sessionLogout();
    // }
  }, []);

  const sessionLogout = (e) => {
    e?.preventDefault();
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${baseURL}/api/auth/logoutuser/`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        localStorage.clear();
        Cookies.remove("X-CSRF-Token");
        router.push("/");
        console.log(result);
      })
      .catch((error) => console.error(error));
  };
  return (
    <>
      <FloatingNavbar />
      <InstallButton />
      <div className="py-4 max-h-screen overflow-auto pb-floatingNavHeight">
        <div className="py-5">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <div className="px-[10px]">
          <div className="flex justify-between items-center px-1 mt-5">
            <div className="flex gap-2 items-center">
              <span
                className={`h-2 w-2 animate-pulse rounded-full ${
                  loading ? "bg-theme_red" : "bg-theme_green"
                }`}
              ></span>
              <div className="flex justify-between items-center w-full">
                <div>
                  {loading ? (
                    <div className="flex justify-center">
                      <span className="circle animate-loader"></span>
                      <span className="circle animate-loader animation-delay-200"></span>
                      <span className="circle animate-loader animation-delay-400"></span>
                    </div>
                  ) : (
                    <span className="text-base font-normal tracking-widest text-theme_text_normal">
                      {studentName?.length > 20
                        ? `${studentName.slice(0, 20)}...`
                        : toTitleCase(studentName)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center justify-end">
              {swapToClub && (
                <button
                  className="z-10 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 p-2 rounded-md text-theme_text_normal text-center tracking-wider text-xs font-semibold flex items-center justify-center gap-2"
                  onClick={() => router.push("/client/login/club")}
                >
                  <span>Club</span>
                  <img
                    src="/icons/swap/white.svg"
                    alt="Club Swap"
                    className="w-4 h-auto"
                  />
                </button>
              )}
              <div>
                <RWebShare
                  data={{
                    text: "Campus Web",
                    url: "https://campusweb.vercel.app/",
                    title: "The Campus Web",
                  }}
                >
                  <button className="z-10 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 p-2 rounded-md text-theme_text_normal w-full text-center tracking-wider font-semibold">
                    <img
                      src="/icons/share/white.svg"
                      alt="Share"
                      className="w-4 h-auto"
                    />
                  </button>
                </RWebShare>
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
                      : menu.name === "WhatsApp"
                      ? () => router.replace(menu.link)
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
          {/* <div className="mt-4">
            <Banner3to1
              imageUrl="/assets/sponsorship/printellect3to1_1.jpg"
              linkUrl="https://play.google.com/store/apps/details?id=com.printellect.printellect"
              altText="Banner 3:1"
            />
          </div> */}
          <EventCarousel />

          {!loading && (
            <div className="mt-4">
              {/* <DashboardTimetable /> */}
              {/*<SectionTitle
                title="Timetable"
                icon="/icons/sun/white.svg"
                textColor="theme_text_normal"
              />
              <div className="theme_box_bg backdrop-blur-lg p-3 flex flex-col gap-4 items-start h-full text-sm text-theme_text_primary mb-3">
                <span>
                  This is a temporary fix for viewing timetable. There is an
                  issue with with the Academia where some data is yet to be
                  loaded.
                  <br /> <br /> Until then you can view your timetable in the timetable
                  section. We apologize for the inconvenience caused.
                </span>
                <button
                  className={`z-10 p-2 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2
                
              `}
                  onClick={() => router.push("/student/timetable")}
                >
                  <span>Go to Timetable</span>
                </button>
              </div>*/}
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
