import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const YourStats = ({}) => {
  const [courseData, setCourseData] = useState([]);
  const [testPerformance, setTestPerformance] = useState([]);

  useEffect(() => {
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
        setTestPerformance(result?.testPerformances);
      })
      .catch((error) => console.error(error));
  }, []);

  let attendance = 0;
  for (let i = 0; i < courseData.length; i++) {
    attendance += Number(courseData[i]?.attendancePercent);
  }

  let marksObtained = 0;
  let totalMarksObtained = 0;
    for (let i = 0; i < testPerformance.length; i++) {
    marksObtained += testPerformance[i]?.totalMarkGot;
    totalMarksObtained += testPerformance[i]?.totalMarks;
    }

  const stats = [
    {
      name: "Attendance",
      value: `${(attendance / courseData.length).toFixed(2)} %`,
    },
    {
      name: "Marks",
      value: `${marksObtained} / ${totalMarksObtained}`,
    },
  ];
  return (
    <>
      <div className="mt-5">
        <SectionTitle
          title="Your Standings"
          icon="/icons/user/white.svg"
          textColor="theme_text_normal"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats?.map((stat, index) => (
          <div
            key={index}
            className="theme_box_bg py-6 px-4 flex flex-col gap-3 justify-between items-center"
          >
            <span className="text-2xl text-theme_text_normal font-semibold tracking-wide">
              {stat.value}
            </span>
            <span className="text-lg text-theme_text_normal/80 font-medium tracking-wide">
              {stat.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default YourStats;
