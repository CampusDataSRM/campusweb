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
  const [loading, setLoading] = useState(true);
  const clubNav = [
    {
      name: "Create Event",
      icon: "/icons/plus/primary.svg",
      link: { path: "/club/admin/form", type: "createEvent" },
    },
    {
      name: "Club Profile",
      icon: "/icons/user-group/primary.svg",
      link: { path: "/club/profile", type: "clubProfile" },
    },
  ];

  useEffect(() => {
    setLoading(true);
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
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      router.push("/");
    }
  }, []);

  const clubStats = [
    { name: "Popularity", icon: "/icons/star.svg", value: "157x" },
    { name: "Events", icon: null, value: club?.events?.length || 0 },
  ];

  const sessionLogout = () => {
    console.log("Logging out");
    Cookies.remove("clubAuth");
    router.push("/");
  };
  return (
    <>
      <div className="px-4 max-h-screen overflow-auto">
        <div className="py-10">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <div className="flex justify-between items-center px-1 mt-3">
          <div className="flex gap-2 items-center">
            <span
              className={`h-2 w-2 animate-pulse rounded-full ${
                loading ? "bg-theme_red" : "bg-theme_green"
              }`}
            ></span>
            <div>
              {loading ? (
                <div className="flex justify-center">
                  <span className="circle animate-loader"></span>
                  <span className="circle animate-loader animation-delay-200"></span>
                  <span className="circle animate-loader animation-delay-400"></span>
                </div>
              ) : (
                <span className="text-base font-normal tracking-widest text-theme_text_normal">
                  {club?.club?.name}
                </span>
              )}
            </div>
          </div>
          <button
            className="flex items-center gap-2 text-theme_text_primary text-lg py-2 font-mono font-semibold"
            onClick={sessionLogout}
            type="button"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#91c3e7"
            >
              <path d="M480-48q-89.64 0-168.48-34.02-78.84-34.02-137.16-92.34-58.32-58.32-92.34-137.16T48-480q0-90.6 33.5-168.8Q115-727 174-786l75 75q-44.95 44.55-69.97 103.28Q154-549 154-480.33 154-343 248.74-248.5 343.49-154 480-154t231.26-94.74Q806-343.49 806-480q0-69-25.03-127.72Q755.95-666.45 711-711l75-75q59 59 92.5 137.2Q912-570.6 912-480q0 89.52-33.5 168.26t-91.99 137.16q-58.48 58.42-137.55 92.5Q569.9-48 480-48Zm-53-379v-485h106v485H427Z" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-theme_text_normal font-medium mt-2">
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
                club.events
                  .slice(0)
                  .reverse()
                  .map((event, index) => (
                    <EventCard event={event} club={club.club} key={index} />
                  ))}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-theme_text_primary flex justify-start gap-2 content-center text-lg py-6">
              <span>
                {" "}
                <img
                  src="/icons/user-group/secondary.svg"
                  className="mt-1"
                />{" "}
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
