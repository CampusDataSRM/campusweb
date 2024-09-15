"use client";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";

const Calendar = () => {
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
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/auth/planner", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setPlanner(result);
        setGetMonth(Object.keys(result));
        setLoading(false);
      })
      .catch((error) => console.error(error));
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
  return (
    <>
      <div className="max-h-screen overflow-auto sm:hidden">
        <Navbar items={pageNames.filter(item => item !== "Calendar")} />
        <main className="px-3 pb-3">
          <SectionTitle title="Calendar" />
          <div className="">
            {loading ? (
              <div className="flex justify-center mt-60">
                <Loader />
              </div>
            ) : (
              <>
                <div className="theme_box_bg p-3 flex flex-col gap-4">
                  <span className="text-lg text-theme_text_primary">
                    Calendar
                  </span>
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
                                  id={todayDate.getDate() ===
                                    Number(item.Date) &&
                                    monthArray[currentMonthID] ===
                                      monthArray[todayDate.getMonth()]
                                      ? "activeDay"
                                    : ""}
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
                                  >
                                    <span className="font-normal text-sm">
                                      {item.Day}
                                    </span>
                                    <span className="font-medium text-base">
                                      {item.Date}
                                    </span>
                                  </div>
                                  <div
                                    className={`w-full text-theme_text_normal flex justify-start items-center rounded-xl px-3 py-1 ${
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
                                    <span className="max-h-10 overflow-hidden text-ellipsis text-sm tracking-wide">
                                      {item.Dayorder === "-"
                                        ? item.Event
                                          ? item.Event
                                          : "Holiday"
                                        : item.Event
                                        ? item.Event
                                        : "Nothing Today"}
                                    </span>
                                  </div>
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
