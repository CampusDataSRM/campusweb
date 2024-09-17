"use client";

import Link from "next/link";
import { useState } from "react";
import UpdateClubProfile from "@/components/club/update/profile";
import UpdatePassword from "@/components/club/update/password";

const ClubProfile = () => {
  const clubNav = [
    {
      name: "Dashboard",
      icon: "/icons/home/primary.svg",
      link: { path: "/club/admin/dashboard", type: "home" },
    },
    {
      name: "Create Event",
      icon: "/icons/plus/primary.svg",
      link: { path: "/club/admin/form", type: "event" },
    },
  ];

  const profileSection = [
    { name: "General Details", children: <UpdateClubProfile /> },
    { name: "Change Password", children: <UpdatePassword /> },
  ];
  const [active, setActive] = useState(profileSection.map((ele) => ele.name));
  return (
    <>
      <main className="max-h-screen overflow-auto px-3 pb-5">
        <div className="pt-10 pb-5">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-theme_text_normal font-medium mt-3">
          {clubNav.map((nav, index) => (
            <Link
              className="flex justify-center gap-3 theme_box_bg py-6 items-center rounded-md text-center"
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
                <img src={nav.icon} className="h-5" />{" "}
              </span>{" "}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-20 mt-10">
          {profileSection.map((section, index) => (
            <div className="flex flex-col gap-5 text-white" key={index}>
              <div className="flex justify-between items-center text-theme_text_primary border-b border-theme_text_primary/70 pb-1">
                <span className="text-lg font-semibold tracking-wider">
                  {section.name}
                </span>
                <span className="">
                  {active.includes(section.name) ? (
                    <button
                      onClick={() => {
                        setActive(active.filter((ele) => ele !== section.name));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#91c3e7"
                      >
                        <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActive([...active, section.name]);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#91c3e7"
                      >
                        <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                      </svg>
                    </button>
                  )}
                </span>
              </div>
              <div>
                {active.includes(section.name) && <>{section.children}</>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default ClubProfile;
