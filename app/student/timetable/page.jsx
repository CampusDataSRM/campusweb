"use client";

import TimetableCard from "@/components/student/timetable";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";

const Timetable = () => {

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
      <div className="max-h-screen overflow-auto sm:hidden">
        <Navbar items={pageNames.filter(item => item !== "Timetable")} />
        <main className="px-4">
          <SectionTitle title="Timetable" />
          {loading ? (
            <div className="flex justify-center mt-60">
              <Loader />
            </div>
          ) : (
            <>
              <div className="theme_box_bg px-3 py-3 flex gap-5 items-center">
                {dayOrders.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={`${
                      selectedDay === day
                        ? "border-2 border-theme_green"
                        : "border-0"
                    } bg-theme_primary text-theme_text_normal rounded-xl h-9 w-9 font-medium hover:border-2 hover:border-theme_green`}
                  >
                    {day[day.length - 1]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-5 mt-3">
                <div className="grid grid-cols-1 gap-4 pb-3">
                  <div className={"grid grid-cols-1 gap-4"}>
                    {Object.keys(
                      timetable.timetable
                        ? timetable.timetable[selectedDay]
                          ? timetable.timetable[selectedDay]
                          : {}
                        : {}
                    ).map((item, index) => (
                      <TimetableCard
                        key={index}
                        subjectName={
                          timetable.timetable[selectedDay][item].subject_name
                        }
                        subjectType={
                          timetable.timetable[selectedDay][item].subject_type
                        }
                        classRoom={
                          timetable.timetable[selectedDay][item].room_code ? timetable.timetable[selectedDay][item].room_code : "Not Assigned"
                        }
                        timing={item}
                      />
                    ))}
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
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default Timetable;
