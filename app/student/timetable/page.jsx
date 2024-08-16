"use client";

import TimetableCard from "@/components/student/timetable";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { studentPageLink } from "@/components/global/navbar/page-link";

const Timetable = () => {
  const navMenu = [
    {
      name: studentPageLink.dashboard.name,
      link: studentPageLink.dashboard.link,
      icon: studentPageLink.dashboard.icon,
    },
    {
      name: studentPageLink.attendance.name,
      link: studentPageLink.attendance.link,
      icon: studentPageLink.attendance.icon,
    },
    {
      name: studentPageLink.marks.name,
      link: studentPageLink.marks.link,
      icon: studentPageLink.marks.icon,
    },
    {
      name: studentPageLink.planner.name,
      link: studentPageLink.planner.link,
      icon: studentPageLink.planner.icon,
    },
  ];
  return (
    <>
      <div className="max-h-screen overflow-auto">
        <Navbar items={navMenu} />
        <main className="px-4">
          <SectionTitle title="Timetable" />
          <TimetableCard />
        </main>
      </div>
    </>
  );
};

export default Timetable;