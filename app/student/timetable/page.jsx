"use client";

import TimetableCard from "@/components/student/timetable";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";
import { getTimetableData } from "@/functions/api/student";
import { useRouter, useSearchParams } from "next/navigation";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";
import FloatingNavbar from "@/components/global/floatingNavbar";
import PrintTimetable from "@/components/student/timetable/print";
import { generatePDF } from "@/functions/generatePDF";
import { downloadImage } from "@/functions/generateImage";

const Timetable = () => {
  const router = useRouter();
  const query = useSearchParams();

  const [timetable, setTimetable] = useState([]);
  const [dayOrders, setDayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [currentDayOrder, setCurrentDayOrder] = useState(null);
  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    } else {
      if (localStorage.getItem("studentTimetable")) {
        const res = JSON.parse(localStorage.getItem("studentTimetable"));
        setTimetable(res);

        if (res?.timetable) {
          setDayOrders(Object.keys(res.timetable));
        } else {
          setDayOrders([]);
        }

        setSelectedDay("Day" + (query.get("do") || res?.day_order));
        setCurrentDayOrder(query.get("do") || res?.day_order);
        setLoading(false);
      } else {
        const rawData = localStorage.getItem("studentData");
        const dataStudent = JSON.parse(rawData);
        const studentBatch =
          dataStudent?.comboBatch[dataStudent?.comboBatch.length - 1];
        const myHeaders = new Headers();
        myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          cache: "no-store",
        };

        fetch(`${baseURL}/api/auth/timetable/${studentBatch}`, requestOptions)
          .then((response) => {
            console.log(" : ", response);

            if (typeof response === "string") {
              return null;
            } else if (response.status === 500) {
              sessionLogout();
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
            } else {
              setTimetable(result);
              localStorage.setItem("studentTimetable", JSON.stringify(result));
              setDayOrders(Object.keys(result.timetable && result.timetable));
              setSelectedDay("Day" + (query.get("do") || result?.day_order));
              setCurrentDayOrder(query.get("do") || result?.day_order);
            }
            setLoading(false);
          })
          .catch((error) => console.error(error));
      }
    }
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
      
      <div className="max-h-screen overflow-auto">
        <Navbar items={pageNames.filter((item) => item !== "Timetable")} />
        <FloatingNavbar />
        <main className="px-4">
          <div className="flex justify-between items-center">
            <SectionTitle title="Timetable" />
            <button
              className="z-10 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 p-2 rounded-md text-theme_text_normal text-center tracking-wider text-xs font-semibold flex items-center justify-center gap-2"
              onClick={() => downloadImage("timetable")}
            >
              <span>Download</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="#ffffff"
              >
                <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
              </svg>
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center mt-60">
              <Loader />
            </div>
          ) : (
            <>
              <div className="theme_box_bg backdrop-blur-lg px-6 py-3 flex gap-6 items-center mb-5">
                {dayOrders.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(day)}
                    className={`${
                      selectedDay === day
                        ? "bg-theme_primary font-black scale-110"
                        : "border-0 bg-theme_primary/40 "
                    } text-theme_text_normal rounded-xl h-9 w-9 font-medium `}
                  >
                    {day[day.length - 1]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-5 -mt-2">
                <div className="grid grid-cols-1 gap-4 pb-3">
                  <div
                    className={"grid grid-cols-1 gap-4 pb-floatingNavHeight"}
                  >
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
                          timetable.timetable[selectedDay][item].room_code
                            ? timetable.timetable[selectedDay][item].room_code
                            : "Not Assigned"
                        }
                        timing={item}
                        isCurrntDayOrder={
                          currentDayOrder == selectedDay.split("Day")[1]
                        }
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
                          No classes scheduled for{" "}
                          {query.get("do") ? "this day" : "today"}
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
      <PrintTimetable />
    </>
  );
};

export default Timetable;