"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCard from "@/components/global/events/event-card";
import Link from "next/link";
import Cookies from "js-cookie";

const Dashboard = () => {
  const router = useRouter();
  const [club, setClub] = useState({});
  const clubNav = [
    {
      name: "Create Event",
      icon: "/icons/plus/primary.svg",
      link: { path: "/mobile/club/admin/form", type: "createEvent" },
    },
    {
      name: "Club Profile",
      icon: "/icons/users/primary.svg",
      link: { path: "/profile", type: "" },
    },
  ];

  const clubStats = [
    { name: "Popularity", icon: "/icons/star.svg", value: "157x" },
    { name: "Events", icon: null, value: "7" },
  ];

  useEffect(() => {
    if (!Cookies.get("clubAuth")) {
      router.push("/");
    } else {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

      

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      fetch(
        "https://campusapi-puce.vercel.app/api/users/club-events",
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {setClub(result.data);})
        .catch((error) => console.error(error));
    }
  }, []);
  return (
    <>
      <div className="px-4">
        <div className="py-10">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-theme_text_normal font-medium">
          {clubNav.map((nav, index) => (
            <Link
              className="flex justify-center gap-2 theme_box_bg py-6 rounded-md text-center"
              key={index}
              href={{
                pathname: nav.link.path,
                query: {
                  type: nav.link.type,
                },
              }}
            >
              {nav.name}
              <span>
                <img src={nav.icon} />{" "}
              </span>{" "}
            </Link>
          ))}
        </div>
        <div className="px-2 mt-4">
          <div>
            <div className="text-theme_text_primary flex justify-start gap-2 content-center text-lg py-6">
              <span>
                {" "}
                <img
                  src="/icons/calender/secondary.svg"
                  className="mt-1"
                />{" "}
              </span>{" "}
              Our Events
            </div>
            <div className="flex flex-wrap justify-center gap-3 py-1">
              {club?.events &&
                club.events.map((event, index) => (
                  <EventCard event={event} club={club.club} key={index} />
                ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-theme_text_primary flex justify-start gap-2 content-center text-lg py-6">
              <span>
                {" "}
                <img src="/icons/users/secondary.svg" className="mt-1" />{" "}
              </span>{" "}
              Club Standings
            </div>
            <div className="grid grid-cols-2 gap-2">
              {clubStats.map((stat, index) => (
                <div
                  className="theme_box_bg rounded-md p-4 text-center"
                  key={index}
                >
                  <div className="text-theme_text_normal flex justify-center gap-1 text-2xl py-4 text-bold">
                    {stat.value}
                    {stat.icon && <img src={stat.icon} />}
                  </div>
                  <div className="text-theme_text_primary text-sm">
                    {stat.name}
                  </div>
                </div>
              ))}
            </div>
            <br />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
