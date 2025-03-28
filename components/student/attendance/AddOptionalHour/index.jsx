"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { se } from "date-fns/locale";

const AddOptionalHour = () => {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [dayOrders, setDayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [currentDayOrder, setCurrentDayOrder] = useState("");
  useEffect(() => {
    if (localStorage.getItem("studentTimetable")) {
      const res = JSON.parse(localStorage.getItem("studentTimetable"));
      setTimetable(res);
      setDayOrders(Object.keys(res.timetable && res.timetable));
      setSelectedDay("Day" + res?.day_order);
      setCurrentDayOrder("Day" + res?.day_order);
      if (localStorage.getItem("optionalHour")) {
        setOptionalHour(JSON.parse(localStorage.getItem("optionalHour")));
      } else {
        setOptionalHour({});
      }
    } else {
      toast.error("Timetable not found");
    }
  }, []);
  const [optionalHour, setOptionalHour] = useState({});
  const [updateOptionalHour, setUpdateOptionalHour] = useState(0);

  const addOptionalHour = (dayOrder, time) => {
    setOptionalHour((prev) => ({
      ...prev,
      [dayOrder]: prev[dayOrder] ? [...prev[dayOrder], time] : [time],
    }));
  };

  const removeOptionalHour = (dayOrder, time) => {
    setOptionalHour((prev) => ({
      ...prev,
      [dayOrder]: prev[dayOrder]
        ? prev[dayOrder].filter((t) => t !== time)
        : [],
    }));
  };

  useEffect(() => {
    if (updateOptionalHour > 0) {
      if (Object.keys(optionalHour).length === 0) {
        toast.error("Select at least one optional hour");
      } else {
        localStorage.setItem("optionalHour", JSON.stringify(optionalHour));
        toast.success("Optional hours Updated");
      }
    }
  }, [optionalHour]);

  return (
    <>
      <main className="">
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
                          ? "bg-theme_primary font-black"
                          : "bg-theme_primary/40"
                      } bg-theme_primary text-theme_text_normal rounded-md text-sm h-[30px] w-[30px] font-medium`}
                    >
                      {day[day.length - 1]}
                    </button>
                  ))}
                </div>
                <button
                  className="text-theme_primary tracking-wide text-sm"
                  onClick={() => {
                    localStorage.removeItem("optionalHour");
                    toast.success("Cleared Optional hours");
                    setOptionalHour({});
                  }}
                >
                  {" "}
                  Reset{" "}
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
                    .slice(0, 5)
                    .map((item, index) => (
                      <button
                        onClick={() => {
                          if (
                            timetable.timetable[selectedDay][
                              item
                            ].subject_name.includes("No class")
                          ) {
                            toast.error("No class scheduled for this hour");
                          } else {
                            if (
                              optionalHour[selectedDay] &&
                              optionalHour[selectedDay].includes(item)
                            ) {
                              removeOptionalHour(selectedDay, item);
                            } else {
                              addOptionalHour(selectedDay, item);
                            }
                          }
                          setUpdateOptionalHour((prev) => prev + 1);
                        }}
                        key={index}
                        className={` px-2 py-[10px] rounded-lg text-sm tracking-wider
                    ${
                      optionalHour[selectedDay] &&
                      optionalHour[selectedDay].includes(item)
                        ? "bg-[#0C4DA2]/20"
                        : timetable.timetable[selectedDay][
                            item
                          ].subject_name.includes("No class")
                        ? "bg-[#0C4DA2]/20"
                        : "bg-theme_primary/95"
                    }`}
                      >
                        <div className="w-full flex justify-start gap-3 items-center">
                          <span className="text-theme_text_normal">
                            {item && item.split(" ")[0]}
                          </span>
                          <span className="text-theme_text_normal text-nowrap truncate">
                            {
                              timetable.timetable[selectedDay][item]
                                .subject_name
                            }
                          </span>
                        </div>
                      </button>
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
                    .slice(5, 10)
                    .map((item, index) => (
                      <button
                        onClick={() => {
                          if (
                            timetable.timetable[selectedDay][
                              item
                            ].subject_name.includes("No class")
                          ) {
                            toast.error("No class scheduled for this hour");
                          } else {
                            if (
                              optionalHour[selectedDay] &&
                              optionalHour[selectedDay].includes(item)
                            ) {
                              removeOptionalHour(selectedDay, item);
                            } else {
                              addOptionalHour(selectedDay, item);
                            }
                          }
                          setUpdateOptionalHour((prev) => prev + 1);
                        }}
                        key={index}
                        className={` px-2 py-[10px] rounded-lg text-sm tracking-wider
                    ${
                      optionalHour[selectedDay] &&
                      optionalHour[selectedDay].includes(item)
                        ? "bg-[#0C4DA2]/20"
                        : timetable.timetable[selectedDay][
                            item
                          ].subject_name.includes("No class")
                        ? "bg-[#0C4DA2]/20"
                        : "bg-theme_primary/95"
                    }`}
                      >
                        <div className="w-full flex justify-start gap-3 items-center">
                          <span className="text-theme_text_normal">
                            {item && item.split(" ")[0]}
                          </span>
                          <span className="text-theme_text_normal text-nowrap truncate">
                            {
                              timetable.timetable[selectedDay][item]
                                .subject_name
                            }
                          </span>
                        </div>
                      </button>
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

export default AddOptionalHour;
