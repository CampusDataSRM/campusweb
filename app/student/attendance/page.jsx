"use client";
import AttendanceCard from "@/components/student/attendance";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import Navbar from "@/components/global/navbar";
import { studentPageLink } from "@/components/global/navbar/page-link";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";

const Attendance = () => {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("studentAuth"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/auth/user/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setCourseData(result?.courses);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);
  const navMenu = [
    {
      name: studentPageLink.dashboard.name,
      link: studentPageLink.dashboard.link,
      icon: studentPageLink.dashboard.icon,
    },
    {
      name: studentPageLink.marks.name,
      link: studentPageLink.marks.link,
      icon: studentPageLink.marks.icon,
    },
    {
      name: studentPageLink.timetable.name,
      link: studentPageLink.timetable.link,
      icon: studentPageLink.timetable.icon,
    },
    {
      name: studentPageLink.planner.name,
      link: studentPageLink.planner.link,
      icon: studentPageLink.planner.icon,
    },
  ];
  return (
    <>
      <div className="pb-2 h-screen overflow-y-auto sm:hidden">
        <Navbar items={navMenu} />
        <div className="px-4">
          <SectionTitle title="Attendance" />
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-5">
              {courseData.map((course, index) => (
                <AttendanceCard key={index} attendance={course} />
              ))}
            </div>
          )}
          <br />
        </div>
      </div>
    </>
  );
};

export default Attendance;
