"use client";
import AttendanceCard from "@/components/student/attendance";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import Cookies from "js-cookie";
import { pageNames } from "@/components/global/navbar/page-link";
import { getStudentData } from "@/functions/api/student";
import { useRouter } from "next/navigation";

const Attendance = () => {
  const router = useRouter();
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token")) {
      router.push("/client/login/student");
    }
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
        } else {
          setCourseData(data?.content.courses);
          localStorage.setItem("studentData", JSON.stringify(data?.content));
        }
      });
    }
  }, []);
  return (
    <>
      <div className="pb-2 h-screen overflow-y-auto sm:hidden">
        <Navbar items={pageNames.filter((item) => item !== "Attendance")} />
        <div className="px-3">
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
