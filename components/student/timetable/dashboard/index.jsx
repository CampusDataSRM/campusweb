"use client";

import DasbboardTimetableCard from "./timetable-card";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { useRouter } from "next/navigation";

const DashboardTimetable = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [dayOrders, setDayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  useEffect(() => {
    setLoading(true);
    const rawData = localStorage.getItem("studentData");
    const dataStudent = JSON.parse(rawData);
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://campusapi-puce.vercel.app/api/auth/timetable/${dataStudent?.comboBatch}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setTimetable(result);
        setDayOrders(Object.keys(result.timetable && result.timetable));
        setSelectedDay(result && "Day" + result?.day_order);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <>
      <main className="">
        <SectionTitle
          title="Timetable"
          icon="/icons/sun/white.svg"
          textColor="theme_text_normal"
        />
        <div className="-mt-3">
          {loading ? (
            <div className="flex justify-center p-5">
              <svg
                className="animate-spin mx-auto h-7 w-7 text-theme_primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : (
            <>
              <div className="theme_box_bg flex justify-between items-center px-3 py-3">
                <div className="flex gap-4 items-center">
                  {dayOrders.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(day)}
                      className={`${
                        selectedDay === day
                          ? "border-2 border-theme_green"
                          : "border-0"
                      } bg-theme_primary text-theme_text_normal rounded-md text-sm h-[30px] w-[30px] font-medium hover:border-2 hover:border-theme_green`}
                    >
                      {day[day.length - 1]}
                    </button>
                  ))}
                </div>
                <button
                  className="text-theme_primary tracking-wide text-sm"
                  onClick={() => router.push("/student/timetable")}
                >
                  {" "}
                  Expand{" "}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-2">
                  {Object.keys(
                    timetable.timetable
                      ? timetable.timetable[selectedDay]
                        ? timetable.timetable[selectedDay]
                        : {}
                      : {}
                  )
                    .slice(0, 5) // First 5 items
                    .map((item, index) => (
                      <DasbboardTimetableCard
                        key={index}
                        subjectName={
                          timetable.timetable[selectedDay][item].subject_name
                        }
                        subjectType={
                          timetable.timetable[selectedDay][item].subject_type
                        }
                        classRoom={
                          timetable.timetable[selectedDay][item].room_code
                            ? timetable.timetable[selectedDay][item].room_code
                            : "Not Assigned"
                        }
                        timing={item}
                      />
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                  {Object.keys(
                    timetable.timetable
                      ? timetable.timetable[selectedDay]
                        ? timetable.timetable[selectedDay]
                        : {}
                      : {}
                  )
                    .slice(5, 10) // Next 5 items
                    .map((item, index) => (
                      <DasbboardTimetableCard
                        key={index}
                        subjectName={
                          timetable.timetable[selectedDay][item].subject_name
                        }
                        subjectType={
                          timetable.timetable[selectedDay][item].subject_type
                        }
                        classRoom={
                          timetable.timetable[selectedDay][item].room_code
                            ? timetable.timetable[selectedDay][item].room_code
                            : "Not Assigned"
                        }
                        timing={item}
                      />
                    ))}
                </div>
              </div>
              {Object.keys(
                timetable.timetable
                  ? timetable.timetable[selectedDay]
                    ? timetable.timetable[selectedDay]
                    : {}
                  : {}
              ).length === 0 && (
                <div className="theme_box_bg px-4 py-6">
                  <span className="text-theme_text_normal flex justify-center">
                    No classes scheduled for today
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default DashboardTimetable;
