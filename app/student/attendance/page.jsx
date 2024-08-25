"use client";
import AttendanceCard from "@/components/student/attendance";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";

const Attendance = () => {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

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
  return (
    <>
      <div className="pb-2 h-screen overflow-y-auto sm:hidden">
        <Navbar items={['Dashboard', 'Marks', 'Timetable', 'Planner']} />
        <div className="px-4">
          <SectionTitle title="Attendance" />
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
