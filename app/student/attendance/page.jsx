"use client";
import AttendanceCard from "@/components/student/attendance";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import Navbar from "@/components/global/navbar";

const Attendance = () => {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append(
      "X-CSRF-Token",
      "wms-tkp-token_client_10002227248=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Domain=academia.srmist.edu.in; Path=/ wms-tkp-token_client_10002227248=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Domain=srmist.edu.in; Path=/ wms-tkp-token_client_10002227248=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Domain=edu.in; Path=/ wms-tkp-token_client_10002227248=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:10 GMT; Path=/ _iamadt_client_10002227248=b77f1208cbc172c04860d0e2ed253cabef165a2ab0cf5740b7e90a8b9d2b28362f1110685f4e31fb3e619ced2e6c8d141d4a2b0120115f1e82cda93bc48bf799; Max-Age=3024000; Expires=Thu, 19-Sep-2024 08:02:32 GMT; HttpOnly; Domain=academia.srmist.edu.in; Path=/; Secure; SameSite=None;priority=High _iambdt_client_10002227248=7c9bf6d0e360835f28c64cec664cce33df7e64ba6bb3465d0c2841b3a546d2d827fa26d520ad98e4ec03a000bd7357f8717a3c7f8fe8ba658654a91b88d185ee; Max-Age=3024000; Expires=Thu, 19-Sep-2024 08:02:32 GMT; HttpOnly; Domain=academia.srmist.edu.in; Path=/; Secure; SameSite=None;priority=High _z_identity=true; Path=/; Secure;priority=Medium"
    );

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
      name: "Dashboard",
      link: "/student",
      icon: "/icons/home/primary.svg",
    },
    {
      name: "Events",
      link: "/student/events",
      icon: "/icons/calender/primary.svg",
    },
    {
      name: "Marks",
      link: "/student/attendance",
      icon: "/icons/bar-chart/primary.svg",
    },
    {
      name: "Planner",
      link: "/student/attendance",
      icon: "/icons/loader/primary.svg",
    },
  ];
  return (
    <>
      <div className="pb-2 h-screen overflow-y-auto sm:hidden">
        <Navbar items={navMenu} />
        <div className="px-4">
          <div className="text-theme_text_primary flex justify-start items-center gap-2 content-center text-xl py-6 font-semibold">
            Attendance
          </div>
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
