"use client";

import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import ClubCard from "@/components/global/club/club-card";
import {
  pageNames,
  studentPageLink,
} from "@/components/global/navbar/page-link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { baseURL } from "@/constants/baseURL";
import FloatingNavbar from "@/components/global/floatingNavbar";

const Clubs = () => {
  const router = useRouter();
  const [clubData, setClubData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentID, setStudentID] = useState("");
  useEffect(() => {
    setLoading(true);
    if (!Cookies.get("X-CSRF-Token") || !localStorage.getItem("studentData")) {
      router.push("/client/login/student");
    } else {
      const student = JSON.parse(localStorage.getItem("studentData"));
      setStudentID(student.registrationNumber);
      const requestOptions = {
        method: "GET",
        redirect: "follow",
        cache: "no-cache",
      };

      fetch(`${baseURL}/api/users/allclub`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          setClubData(result.data);
          setLoading(false);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const [clubQuery, setClubQuery] = useState("");
  return (
    <>
      <div className="max-h-screen overflow-auto pb-floatingNavHeight">
        <Navbar items={pageNames.filter((item) => item !== "Clubs")} />
        <FloatingNavbar />
        <main className="px-3">
          <div className="flex justify-between items-center">
            <SectionTitle
              title="Clubs"
              icon={"/icons/user-group/secondary.svg"}
            />
            <button
              className="z-10 bg-gradient-to-br from-theme_primary/90 to-theme_secondary/90 p-2 rounded-md text-theme_text_normal text-center text-[13px] font-semibold flex items-center justify-center gap-2 tracking-widest"
              onClick={() => router.push("/client/login/club")}
            >
              <span>Your Club</span>
              <img
                src="/icons/swap/white.svg"
                alt="Club Swap"
                className="w-4 h-auto"
              />
            </button>
          </div>
          <form className="mb-5 -mt-2 flex gap-2 items-center theme_box_bg w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              className="ml-2"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#91c3e7"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            <input
              type="text"
              className="bg-transparent py-4 rounded-lg w-full text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-base placeholder:font-medium placeholder:tracking-wide shadow-xl focus:outline-none"
              placeholder="Search"
              value={clubQuery && clubQuery}
              onChange={(e) => setClubQuery(e.target.value)}
            />
            <button
              className={`mr-2 + ${clubQuery ? "" : "hidden"}`}
              onClick={(e) => {
                e.preventDefault();
                setClubQuery("");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#91c3e7"
              >
                <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
              </svg>
            </button>
          </form>
          {loading ? (
            <div className="flex justify-center mt-60 content-center">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {clubData?.clubs ? (
                clubData?.clubs
                  .filter((e) => {
                    if (clubQuery === "") return e;
                    else if (
                      e?.name
                        ?.toLowerCase()
                        .includes(clubQuery.toLowerCase()) ||
                      e?.description
                        ?.toLowerCase()
                        .includes(clubQuery.toLowerCase()) ||
                      e?.labels?.some((label) =>
                        label.toLowerCase().includes(clubQuery.toLowerCase())
                      )
                    )
                      return e;
                  })
                  .sort((a, b) => b.popularity - a.popularity)
                  .map((club, index) => (
                    <ClubCard
                      key={index + club.name}
                      club={club}
                      clubID={club?.id}
                      checkLiked={
                        club.likedby ? club.likedby.includes(studentID) : false
                      }
                    />
                  ))
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    Failed to load Clubs
                  </span>
                </div>
              )}
              <div className="theme_box_bg py-6 w-full flex flex-col gap-4 px-1">
                <span className="text-theme_text_normal/80 font-norma tracking-wide text-lg flex justify-center">
                  More Clubs Joining Soon...
                </span>
                <Link
                  className="text-theme_text_primary font-medium tracking-wide flex flex-wrap gap-2 justify-center"
                  href={{
                    pathname: "/client/signup/club",
                    query: { type: "clubSignUp" },
                  }}
                >
                  Are you a Club Organiser?{" "}
                  <span className="text-theme_secondary">Register Now!</span>
                </Link>
              </div>
            </div>
          )}
        </main>
        <br />
      </div>
    </>
  );
};

export default Clubs;
