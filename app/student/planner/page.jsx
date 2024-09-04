"use client";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import Loader from "@/components/global/loader";
import { pageNames } from "@/components/global/navbar/page-link";
import CWDateRangePicker from "@/components/student/planner/CWDateRangePicker";

const Planner = () => {
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
      mode: "cors",
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
        <Navbar items={pageNames.filter(item => item !== "Planner")} />
        <main className="px-3 pb-3">
          <SectionTitle title="Planner" />
          <CWDateRangePicker />
        </main>
      </div>
    </>
  );
};

export default Planner;
