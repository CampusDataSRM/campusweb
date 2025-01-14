"use client";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";
import { useRouter } from "next/navigation";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";
import Link from "next/link";
import FloatingNavbar from "@/components/global/floatingNavbar";

const Calendar = () => {
  const router = useRouter();
  const [planner, setPlanner] = useState();
  const monthArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [loading, setLoading] = useState(false);
  const todayDate = new Date();
  const [currentMonthID, setCurrentMonthID] = useState(todayDate.getMonth());
  const [getMonth, setGetMonth] = useState([]);

  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token")) {
      router.push("/client/login/student");
    } else {
      if (localStorage.getItem("studentCalendar")) {
        const res = JSON.parse(localStorage.getItem("studentCalendar"));
        setPlanner(res);
        setGetMonth(Object.keys(res));
        setLoading(false);
      }
      const myHeaders = new Headers();
      myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
        cache: "no-store",
      };

      fetch(`${baseURL}/api/auth/planner`, requestOptions)
        .then((response) => {
          if (typeof response === "string") {
            return null;
          } else if (response.status === 429) {
            return "Too many requests";
          } else if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch data");
          }
        })
        .then((result) => {
          if (result === "Too many requests" || result === null) {
            result == null
              ? toast.error("Something went wrong.")
              : toast.error("Too many requests. Try again in a min.");
          } else {
            setPlanner(result);
            setGetMonth(Object.keys(result));
            localStorage.setItem("studentCalendar", JSON.stringify(result));
          }
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const handleMonthChange = (type) => {
    if (type === "prev") {
      if (currentMonthID > 0) {
        setCurrentMonthID(currentMonthID - 1);
      }
    } else if (type === "next") {
      if (currentMonthID < 11) {
        setCurrentMonthID(currentMonthID + 1);
      }
    }
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 500);
  }, [currentMonthID, planner]);
  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Calendar")} />
        <FloatingNavbar />
        <main className="px-3 pb-3">
          <SectionTitle
            title="Calendar"
            icon={"/icons/calender/secondary.svg"}
          />
          <div className="">
            {loading ? (
              <div className="flex justify-center mt-60">
                <Loader />
              </div>
            ) : (
              <>
                <div className="theme_box_bg p-3 flex flex-col gap-4">
                  <div className="flex justify-start items-center text-theme_text_normal">
                    <button
                      className=""
                      onClick={() => handleMonthChange("prev")}
                    >
                      <img
                        src="/icons/chevron/left.svg"
                        alt="left"
                        className="p-1"
                      />
                    </button>
                    <span className="tracking-wide font-medium w-24 text-center">
                      {monthArray[currentMonthID]}
                    </span>
                    <button
                      className=""
                      onClick={() => handleMonthChange("next")}
                    >
                      <img
                        src="/icons/chevron/right.svg"
                        alt="right"
                        className="p-1"
                      />
                    </button>
                  </div>
                  <div className="max-h-[500px] overflow-auto pb-2 flex flex-col gap-2">
                    {planner && planner[getMonth[currentMonthID]] ? (
                      <>
                        {planner[getMonth[currentMonthID]].Data ? (
                          <>
                            {planner[getMonth[currentMonthID]].Data.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="flex gap-2 items-stretch justify-center w-full"
                                  id={
                                    todayDate.getDate() === Number(item.Date) &&
                                    monthArray[currentMonthID] ===
                                      monthArray[todayDate.getMonth()]
                                      ? "activeDay"
                                      : ""
                                  }
                                >
                                  <div
                                    className={`flex flex-col gap-1 items-center justify-center py-2 w-20 rounded-xl text-theme_text_normal theme_box_bg
                                    ${
                                      todayDate.getDate() ===
                                        Number(item.Date) &&
                                      monthArray[currentMonthID] ===
                                        monthArray[todayDate.getMonth()]
                                        ? "border-2 border-theme_green"
                                        : ""
                                    }
                                    `}
                                    ref={
                                      todayDate.getDate() ===
                                        Number(item.Date) &&
                                      monthArray[currentMonthID] ===
                                        monthArray[todayDate.getMonth()]
                                        ? scrollRef
                                        : null
                                    }
                                  >
                                    <span className="font-normal text-sm">
                                      {item.Day}
                                    </span>
                                    <span className="font-medium text-base">
                                      {item.Date}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/student/timetable?do=${item.Dayorder}`}
                                    className={`w-full text-theme_text_normal flex justify-between gap-2 items-center rounded-xl px-3 py-1 ${
                                      item.Event.includes("Holiday") ||
                                      item.Dayorder == "-"
                                        ? "bg-theme_green/80"
                                        : todayDate.getDate() ===
                                            Number(item.Date) &&
                                          monthArray[currentMonthID] ===
                                            monthArray[todayDate.getMonth()]
                                        ? "bg-theme_secondary/80"
                                        : "theme_box_bg"
                                    }`}
                                  >
                                    <span className="overflow-hidden text-ellipsis text-sm tracking-wide w-[83%]">
                                      {item.Dayorder === "-"
                                        ? item.Event
                                          ? item.Event
                                          : "Holiday"
                                        : item.Event
                                        ? item.Event
                                        : "Regular Classes"}
                                    </span>
                                    <span className="overflow-hidden text-ellipsis text-sm tracking-wide whitespace-nowrap w-[17%]">
                                      {`DO ${item.Dayorder}`}
                                    </span>
                                  </Link>
                                </div>
                              )
                            )}
                            {planner[getMonth[currentMonthID]].Data.length ===
                              0 && (
                              <div className="text-theme_text_normal theme_box_bg text-center py-4">
                                No data available
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-theme_text_normal theme_box_bg text-center py-4">
                            No data available
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-theme_text_normal theme_box_bg text-center py-4">
                          No data available
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Calendar;
