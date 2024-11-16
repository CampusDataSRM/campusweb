"use client";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";
import CWDateRangePicker from "@/components/student/planner/CWDateRangePicker";
import { calcPlannerData } from "@/functions/plannerUtils";
import {
  planner as pl,
  timetable as tt,
  userJsonData as ujd,
} from "./mockData";
import AttendanceCard from "@/components/student/attendance";
import {
  getPlannerData,
  getStudentData,
  getTimetableData,
} from "@/functions/api/student";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/global/floatingNavbar";

const Planner = () => {
  const router = useRouter();
  // const [planner, setPlanner] = useState();
  const [plannerData, setPlannerData] = useState();
  const [startDate, setStartDate] = useState(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  );
  const [endDate, setEndDate] = useState(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  );
  const [planner, setPlanner] = useState(pl);
  const [timetable, setTimetable] = useState(tt);
  const [userJsonData, setUserJsonData] = useState(ujd);
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
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    }
    const studentData = localStorage.getItem("studentData");
    if (studentData) {
      setUserJsonData(JSON.parse(studentData));
      setLoading(false);
    }
    getStudentData(Cookies.get("X-CSRF-Token")).then((data) => {
      if ((data.message = "success")) {
        // console.log(data);

        setUserJsonData(data.content);
        setLoading(false);
      } else {
        console.error(data);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);

    const timetableData = localStorage.getItem("timetableData");
    if (timetableData) {
      setTimetable(JSON.parse(timetableData));
      setLoading(false);
    }
    getTimetableData(Cookies.get("X-CSRF-Token")).then((data) => {
      if ((data.message = "success")) {
        setTimetable(data.content);
        setLoading(false);
      } else {
        console.error(data);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const planner = localStorage.getItem("planner");
    if (planner) {
      setPlanner(JSON.parse(planner));
      setLoading(false);
    }
    getPlannerData(Cookies.get("X-CSRF-Token")).then((data) => {
      if ((data.message = "success")) {
        // console.log(data);

        setPlanner(data.content);
        setLoading(false);
      } else {
        console.error(data);
      }
    });
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

  useEffect(() => {
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });

    if (
      startDate != undefined &&
      endDate != undefined &&
      planner != undefined &&
      timetable != undefined &&
      userJsonData["courses"] != undefined
    ) {
      console.log(
        "currentDate",
        currentDate,
        "startDate",
        startDate,
        "endDate",
        endDate,
        "planner",
        planner,
        "timetable",
        timetable,
        "userJsonData",
        userJsonData["courses"]
      );

      let calculatedPlannerData = calcPlannerData(
        currentDate,
        startDate,
        endDate,
        planner,
        timetable,
        userJsonData["courses"]
      );
      console.log("Planner Data from main page", calculatedPlannerData);

      if (calculatedPlannerData) {
        setPlannerData(calculatedPlannerData);
      }
    }
  }, [startDate, endDate, planner, timetable, userJsonData]);

  useEffect(() => {
    // console.log("Planner Data 2 from main page", plannerData);
  }, [plannerData]);

  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Planner")} />
        <FloatingNavbar />
        <main className="px-3 pb-3">
          <SectionTitle title="Planner" />
          <CWDateRangePicker
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {/* {console.log(plannerData)} */}
              {plannerData ? (
                plannerData.map((course, index) => (
                  <AttendanceCard key={index} attendance={course} />
                ))
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    Select a date range to view planner
                  </span>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Planner;
