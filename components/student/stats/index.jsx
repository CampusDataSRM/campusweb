"use client";

import SectionTitle from "@/components/global/section-title";
import { toTwoDecimalPlaces } from "@/functions/round-off";
import { useRouter } from "next/navigation";

const YourStats = ({ courseData, testPerformance }) => {
  const Router = useRouter();

  const applicableCoursesForAvgAttendance = courseData?.filter(
    (course) => Number(course?.hoursConducted) > 0
  ) || [];
  const totalHoursPresent = applicableCoursesForAvgAttendance.reduce(
    (total, course) => total + Number(course?.hoursPresent || 0),
    0
  );
  const totalHoursConducted = applicableCoursesForAvgAttendance.reduce(
    (total, course) => total + Number(course?.hoursConducted || 0),
    0
  );
  const attendance =
    totalHoursConducted > 0
      ? `${((totalHoursPresent * 100) / totalHoursConducted).toFixed(2)} %`
      : "NA";

  let marksObtained = 0;
  let totalMarksObtained = 0;
  for (let i = 0; i < testPerformance?.length; i++) {
    marksObtained += testPerformance[i]?.totalMarkGot;
    totalMarksObtained += testPerformance[i]?.totalMarks;
  }

  const stats = [
    {
      name: "Attendance",
      value: attendance,
      goTo: "/student/attendance",
    },
    {
      name: "Marks",
      value: `${toTwoDecimalPlaces(marksObtained)} / ${totalMarksObtained}`,
      goTo: "/student/marks",
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
      <div className="grid grid-cols-2 gap-2 -mt-3">
        {stats?.map((stat, index) => (
          <div
            key={index}
            className="theme_box_bg py-6 px-4 flex flex-col gap-3 justify-between items-center"
            onClick={() => Router.push(stat.goTo)}
          >
            <span className="text-xl text-theme_text_normal font-semibold tracking-wide text-center text-nowrap">
              {stat.value}
            </span>
            <span className="text-base text-theme_text_normal/80 font-medium tracking-wide">
              {stat.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default YourStats;
