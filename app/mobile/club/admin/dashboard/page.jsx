"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EventCard from "@/components/global/events/event-card";
import Link from "next/link";
import Cookies from "js-cookie";
import { authExpiry } from "@/functions/auth-expiry";

const Dashboard = () => {
  const router = useRouter();
  const [club, setClub] = useState();
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

  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
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
          .then((result) => {
            setClub(result.data);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const clubStats = [
    { name: "Popularity", icon: "/icons/star.svg", value: "157x" },
    {name: "Events", icon: null, value: club?.events?.length || 0 },
  ];

  const sessionLogout = () => {
    console.log("Logging out");
    Cookies.remove("clubAuth");
    router.push("/");
  };
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
        <div className="flex pb-2 justify-end">
          <button
            className="flex items-center gap-2 text-theme_text_primary text-lg py-2 font-mono font-semibold"
            onClick={sessionLogout}
            type="button"
            title="Logout"
          >
            Logout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#91C3E7"
            >
              <path d="M206.78-100.78q-44.3 0-75.15-30.85-30.85-30.85-30.85-75.15v-546.44q0-44.3 30.85-75.15 30.85-30.85 75.15-30.85h277.74v106H206.78v546.44h277.74v106H206.78Zm425.87-152.09L559-328.39 657.61-427H355.48v-106h302.13L559-631.61l73.65-75.52L859.22-480 632.65-252.87Z" />
            </svg>
          </button>
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
