"use client";

import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import ClubCard from "@/components/global/club/club-card";
import { studentPageLink } from "@/components/global/navbar/page-link";

const Clubs = () => {
  const [clubData, setClubData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/users/allclub", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setClubData(result.data);
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
      name: studentPageLink.timetable.name,
      link: studentPageLink.timetable.link,
      icon: studentPageLink.timetable.icon,
    },
    {
      name: studentPageLink.attendance.name,
      link: studentPageLink.attendance.link,
      icon: studentPageLink.attendance.icon,
    },
    {
      name: studentPageLink.events.name,
      link: studentPageLink.events.link,
      icon: studentPageLink.events.icon,
    },
  ];

  return (
    <>
      <div className="max-h-screen overflow-auto">
        <Navbar items={navMenu} />
        <main className="px-5">
          <SectionTitle
            title="Clubs"
            icon={"/icons/user-group/secondary.svg"}
          />
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
                {clubData.clubs && clubData.clubs.map((club, index) => (
                    <ClubCard key={index} club={club} />
                ))}
            </div>
          )}
        </main>
        <br />
      </div>
    </>
  );
};

export default Clubs;
