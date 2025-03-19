"use client";
import Image from "next/image";
import AttendanceCard from "@/components/student/attendance";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";
import { pageNames } from "@/components/global/navbar/page-link";
import { getStudentData } from "@/functions/api/student";
import { predictAttendance } from "@/functions/attendance-prediction";
import { getPlannerData } from "@/functions/api/student";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import FloatingNavbar from "@/components/global/floatingNavbar";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import AddOptionalHour from "@/components/student/attendance/AddOptionalHour";
import { se } from "date-fns/locale";

const defaultStyle =
  "theme_box_bg px-3 py-2 rounded-md text-theme_text_normal text-sm tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-xs shadow-xl";

const Attendance = () => {
  const router = useRouter();
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeTable, setTimeTable] = useState({});

  // format date as dd/mm/yy
  const formatDate = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1).toString().padStart(2, "0");
    let day = "" + d.getDate();
    const year = d.getFullYear().toString().slice(-2);
    return [day, month, year].join("/");
  };

  const [predictBox, setPredictBox] = useState(false);
  const [predictState, setPredictState] = useState(false);
  const [predictionDate, setPredictionDate] = useState({
    currentDate: new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    }),
    startDate: "",
    endDate: "",
  });

  const getMinDate = (currentDate) => {
    const options = { timeZone: "Asia/Kolkata" };
    return new Date(
      new Intl.DateTimeFormat("en-US", {
        ...options,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour12: false,
      }).format(currentDate)
    );
  };

  const getMaxDate = (currentDate) => {
    const options = { timeZone: "Asia/Kolkata" };
    const year = new Intl.DateTimeFormat("en-US", {
      ...options,
      year: "numeric",
    }).format(currentDate);

    const june30 = new Date(Date.UTC(year, 5, 30, 18, 30)); // Adjusting for IST (UTC+5:30)

    if (currentDate.getTime() <= june30.getTime()) {
      return new Date(Date.UTC(year, 5, 30, 18, 30)); // June 30th in IST
    } else {
      return new Date(Date.UTC(year, 11, 31, 18, 30)); // December 31st in IST
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token")) {
      router.push("/client/login/student");
    } else {
      const result = JSON.parse(localStorage.getItem("studentData"));

      if (!result) {
        router.push("/client/login/student");
      } else {
        setCourseData(result?.courses);
        setLoading(false);
        const someResult = getStudentData(Cookies.get("X-CSRF-Token"));
        someResult.then((data) => {
          if (data?.message === "failed_to_fetch") {
            console.log("Failed to fetch data");
          } else if (data?.message === "too_many_requests") {
            toast.error("Too many requests. Try again in a min.");
          } else {
            setCourseData(data?.content.courses);
            localStorage.setItem("studentData", JSON.stringify(data?.content));
          }
        });
      }
      const planner = JSON.parse(localStorage.getItem("studentCalendar"));
      if (!planner && predictBox) {
        const plannerResult = getPlannerData(Cookies.get("X-CSRF-Token"));
        plannerResult.then((data) => {
          if (data?.message === "failed_to_fetch") {
            console.log("Failed to fetch data");
          } else if (data?.message === "too_many_requests") {
            toast.error("Too many requests. Try again in a min.");
          } else {
            localStorage.setItem(
              "studentCalendar",
              JSON.stringify(data?.content)
            );
          }
        });
      }
    }
  }, [predictBox]);

  const [selectedDay, setSelectedDay] = useState([]);
  const [updateCall, setUpdateCall] = useState(0);
  const [optionalHoursSubjects, setOptionalHoursSubjects] = useState({});

  function processAttendancePredictions(
    calendar,
    userTimetable,
    courseData,
    dates
  ) {
    let result = courseData; // Initial courseData
    let currentDate = formatDate(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      })
    ); // Today's date
    for (let i = 0; i < dates.length; i++) {
      let startDate = dates[i];
      let endDate = dates[i];

      if (i > 0) {
        // Set currentDate as the next day of previous startDate
        let rawPrevStartDate = dates[i - 1].split("/");
        let prevStartDate = new Date(
          `${Number(rawPrevStartDate[2]) + 2000}-${rawPrevStartDate[1]}-${
            rawPrevStartDate[0]
          }`
        );
        prevStartDate.setDate(prevStartDate.getDate() + 1);
        currentDate = formatDate(prevStartDate);
      }

      // Call predictAttendance with updated values
      result = predictAttendance(
        calendar,
        userTimetable,
        result,
        currentDate,
        startDate,
        endDate
      );
    }

    return result;
  }

  const updateTimetable = (timetableObject, optionalHours) => {
    let updatedTimetable = { ...timetableObject };

    Object.entries(optionalHours).forEach(([day, times]) => {
      if (updatedTimetable.timetable[day]) {
        times.forEach((time) => {
          delete updatedTimetable.timetable[day][time];
        });
      }
    });

    return updatedTimetable;
  };

  const getOptionalHoursSubjects = (timetable, optionalHours) => {
    Object.entries(optionalHours).forEach(([day, times]) => {
      if (timetable.timetable[day]) {
        setOptionalHoursSubjects((prev) => ({
          ...prev,
          [day]: times.map((time) => ({
            time: time,
            subject: timetable.timetable[day][time]?.subject_name,
          })),
        }));
      }
    });
  };

  useEffect(() => {
    if (!localStorage.getItem("studentTimetable")) {
      toast.error("Timetable not found. Please try again");
      router.push("/student");
      return;
    }
    const timetable = JSON.parse(localStorage.getItem("studentTimetable"));
    if (localStorage.getItem("optionalHour")) {
      const optionalHours = JSON.parse(localStorage.getItem("optionalHour"));
      const updatedTimetable = updateTimetable(timetable, optionalHours);
      console.log(optionalHours);
      getOptionalHoursSubjects(timetable, optionalHours);
      setTimeTable(updatedTimetable);
    } else {
      setTimeTable(timetable);
    }
    if (selectedDay.length > 0) {
      if (!localStorage.getItem("studentCalendar")) {
        toast.error("Calendar not found. Please try again");
        return;
      }
      const sortedDates = selectedDay.sort((a, b) => a - b);
      const dates = sortedDates.map((date) => formatDate(date));
      const result = processAttendancePredictions(
        JSON.parse(localStorage.getItem("studentCalendar")),
        timeTable,
        JSON.parse(localStorage.getItem("studentData"))?.courses,
        dates
      );
      setCourseData(result);
    } else {
      setCourseData(JSON.parse(localStorage.getItem("studentData"))?.courses);
    }
  }, [selectedDay, predictBox, updateCall]);

  const [expandOptionalHour, setExpandOptionalHour] = useState(false);

  console.log(optionalHoursSubjects);

  return (
    <>
      <div className="pb-floatingNavHeight h-screen overflow-y-auto">
        <Navbar items={pageNames.filter((item) => item !== "Attendance")} />
        <FloatingNavbar />
        <div className="px-3">
          <div className="flex justify-between items-center">
            <SectionTitle title="Attendance" />
            <button
              className="z-10 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 p-2 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2"
              onClick={() => {
                setPredictBox(!predictBox);
                setPredictState(false);
                setPredictionDate({
                  currentDate: new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kolkata",
                  }),
                  startDate: "",
                  endDate: "",
                });
              }}
            >
              <span>Predict</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18px"
                viewBox="0 -960 960 960"
                width="18px"
                fill="#FFFFFF"
              >
                <path d="M480-80q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-200v-80h320v80H320Zm10-120q-69-41-109.5-110T180-580q0-125 87.5-212.5T480-880q125 0 212.5 87.5T780-580q0 81-40.5 150T630-320H330Z" />
              </svg>
            </button>
          </div>

          {predictBox && (
            <div className="flex flex-col gap-3 justify-center items-center mb-2 theme_box_bg p-3 rounded-md">
              <div className="flex items-center justify-between gap-2 w-full mb-4">
                <span className="text-theme_text_primary font-semibold tracking-wide pl-4">
                  {" "}
                  Add your Leaves{" "}
                </span>
                <button
                  className="theme_box_bg p-1 rounded-full w-fit"
                  name="close"
                  onClick={() => {
                    setPredictBox(false);
                    setPredictState(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#FFFFFF"
                  >
                    <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
                  </svg>
                </button>
              </div>
              <DayPicker
                mode="multiple"
                selected={selectedDay}
                onSelect={(day) => {
                  setSelectedDay(day);
                }}
                timeZone="Asia/Kolkata"
                disabled={(date) =>
                  date > getMaxDate(new Date()) ||
                  date.getDay() === 0 ||
                  date < getMinDate(new Date())
                }
                classNames={{
                  today: `bg-theme_primary/50 text-theme_text_normal rounded-full`,
                  selected:
                    "bg-theme_secondary/70 text-theme_text_normal rounded-full",

                  day: `${getDefaultClassNames.day} text-theme_text_normal text-center font-medium rounded-full`,
                  disabled: "text-theme_text_normal/50",
                  weekdays: "text-theme_text_primary font-semibold",
                  caption_label: "text-theme_primary text-lg",
                  chevron: "fill-theme_primary p-1",
                }}
              />
              <>
                <div className="flex flex-col gap-3 mt-2 w-full">
                  <div className="flex items-center justify-between gap-2 w-full mt-2 theme_box_bg p-2 pt-4 mb-2">
                    <div className="text-theme_text_primary font-semibold tracking-wide mb-3 pl-1 mt-1">
                      {" "}
                      Add Optional Hours{" "}
                    </div>
                    <button
                      className="-mt-2 bg-theme_primary/20 p-[1px] rounded-full w-fit"
                      name="minimize"
                      onClick={() => setExpandOptionalHour(!expandOptionalHour)}
                    >
                      {expandOptionalHour ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#ffffff"
                          >
                            <path d="m280-400 200-200 200 200H280Z" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#ffffff"
                          >
                            <path d="M480-360 280-560h400L480-360Z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                  {expandOptionalHour && (
                    <div>
                      {" "}
                      <AddOptionalHour />{" "}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center gap-2 py-2 w-full">
                  <div className="flex gap-2">
                    <button
                      className="z-10 bg-gradient-to-br bg-theme_red/50 py-2 px-4 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2"
                      onClick={() => {
                        setSelectedDay([]);
                        localStorage.removeItem("optionalHour");
                        toast.success("Leaves and optional hours cleared");
                      }}
                    >
                      <span>Reset</span>
                    </button>
                  </div>

                  <button
                    className="z-10 bg-gradient-to-br from-theme_primary/75 to-theme_secondary/75 py-2 px-4 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2"
                    onClick={() => {
                      setUpdateCall(updateCall + 1);
                    }}
                  >
                    <span>Update</span>
                  </button>
                </div>
              </>
            </div>
          )}
          {/*optionalHoursSubjects &&
            Object.keys(optionalHoursSubjects).length > 0 && (
              <div className="flex flex-col gap-3 mt-2 w-full">
                <div className="flex items-center justify-between gap-2 w-full mt-2 theme_box_bg p-2 pt-4 mb-2">
                  <div className="text-theme_text_primary font-semibold tracking-wide mb-3 pl-1 mt-1">
                    {" "}
                    Optional Hours{" "}
                  </div>
                  <button
                    className="-mt-2 bg-theme_primary/20 p-[1px] rounded-full w-fit"
                    name="minimize"
                    onClick={() => setExpandOptionalHour(!expandOptionalHour)}
                  >
                    {expandOptionalHour ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="m280-400 200-200 200 200H280Z" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="#ffffff"
                        >
                          <path d="M480-360 280-560h400L480-360Z" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
                {expandOptionalHour && (
                  <div>
                    <div className="flex flex-col gap-2">
                      {Object.entries(optionalHoursSubjects).map(
                        ([day, times], index) => (
                          <div key={index} className="flex flex-col gap-2">
                            <span className="text-theme_text_primary font-semibold tracking-wide text-sm">
                              {day}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {times.map((time, index) => (
                                <span
                                  key={index}
                                  className="bg-theme_secondary/75 text-theme_text_normal text-xs tracking-widest rounded-full p-1 px-2"
                                >
                                  {time.time} - {time.subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )*/}
          {selectedDay.length > 0 && (
            <div className="flex flex-col theme_box_bg p-3 gap-3 mb-4">
              <span className="text-theme_text_primary font-semibold tracking-wide text-sm">
                Selected Dates
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDay.map((day, index) => (
                  <span
                    key={index}
                    className="bg-theme_secondary/75 text-theme_text_normal text-xs tracking-widest rounded-full p-1 px-2"
                  >
                    {formatDate(day)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {courseData ? (
                courseData.map((course, index) => (
                  <AttendanceCard key={index} attendance={course} />
                ))
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    No data found for Attendance
                  </span>
                </div>
              )}
            </div>
          )}
          <br />
        </div>
      </div>
    </>
  );
};

export default Attendance;

{
  /*predictBox && (
            <div className="theme_box_bg pt-3 pb-6 flex flex-col justify-center mb-5 px-3">
              <div className="flex items-center justify-end gap-2 w-full">
                <button
                  className="theme_box_bg p-1 rounded-full w-fit"
                  name="close"
                  onClick={() => {
                    setPredictBox(false);
                    setPredictState(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#FFFFFF"
                  >
                    <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
                  </svg>
                </button>
              </div>
              <span className="text-theme_text_primary font-semibold tracking-wide">
                {" "}
                Set Holiday Period{" "}
              </span>
              <div className="grid grid-cols-11 items-center gap-3 w-full mt-3">
                <input
                  type="date"
                  value={predictionDate.startDate}
                  min={getMinDate(new Date()).toISOString().split("T")[0]}
                  max={getMaxDate(new Date()).toISOString().split("T")[0]}
                  onChange={(e) => {
                    setPredictionDate({
                      ...predictionDate,
                      startDate: e.target.value,
                      endDate: predictionDate.endDate
                        ? predictionDate.endDate < e.target.value
                          ? e.target.value
                          : predictionDate.endDate
                        : predictionDate.endDate,
                    });
                  }}
                  className={`col-span-5 ${defaultStyle} border border-theme_primary/10`}
                  placeholder="Start Date"
                />
                <span className="text-theme_text_normal font-medium text-center">
                  to
                </span>
                <input
                  type="date"
                  value={predictionDate.endDate}
                  min={
                    predictionDate.startDate ||
                    getMinDate(new Date()).toISOString().split("T")[0]
                  }
                  max={getMaxDate(new Date()).toISOString().split("T")[0]}
                  onChange={(e) =>
                    setPredictionDate({
                      ...predictionDate,
                      endDate: e.target.value,
                      startDate: predictionDate.startDate
                        ? predictionDate.startDate > e.target.value
                          ? e.target.value
                          : predictionDate.startDate
                        : predictionDate.startDate,
                    })
                  }
                  className={`col-span-5 ${defaultStyle} border border-theme_primary/10`}
                  placeholder="End Date"
                />
              </div>
              <div className="flex justify-between items-center gap-5 mt-6">
                <button
                  className="z-10 bg-gradient-to-br bg-theme_red/50 py-2 px-4 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={() => {
                    setPredictBox(false);
                    setPredictState(false);
                    setPredictionDate({
                      currentDate: new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Kolkata",
                      }),
                      startDate: "",
                      endDate: "",
                    });
                  }}
                >
                  <span>Close</span>
                </button>
                <button
                  className="z-10 bg-gradient-to-br from-theme_primary/90 min-w-20 to-theme_secondary/90 py-2 px-4 rounded-md text-theme_text_normal text-center tracking-wider text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={predictAttendanceHandler}
                  disabled={predictState}
                >
                  {predictState ? (
                    <svg
                      className="animate-spin mx-auto h-5 w-5 text-white"
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
                  ) : (
                    <span>Apply</span>
                  )}
                </button>
              </div>
            </div>
          )*/
}
