"use client";
import { useRouter } from "next/navigation";
import StudentLogin from "@/app/client/login/student/page";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    Cookies.remove("X-CSRF-Token");
    localStorage.clear();
  }, [router]);
  
  return (
    <>
      {/*<div className="flex flex-wrap justify-center page-center items-center gap-4 lg:gap-12">
        <div className="">
          <img
            src="/logo2.svg"
            alt="campus web"
            className="mx-auto w-[290px] md:w-[350px] h-auto"
          />
        </div>
        <div className="w-[350px] flex flex-col gap-5 mt-3 ">
          <button
            className="theme_box_bg flex flex-col gap-8 justify-center items-center py-10 rounded-lg drop-shadow-xl w-full hover:cursor-pointer"
            onClick={() => router.push("/client/login/student")}
          >
            <div className="">
              <img src="/icons/user/primary.svg" className="w-12" />
            </div>
            <div className="text-theme_text_normal font-medium text-xl">
              Login as a Student
            </div>
          </button>
          <button
            className="theme_box_bg flex flex-col gap-8 justify-center items-center py-10 drop-shadow-xl w-full hover:cursor-pointer rounded-lg"
            onClick={() => router.push("/client/login/club")}
          >
            <div className="">
              <img src="/icons/user-group/primary.svg" className="w-12" />
            </div>
            <div className="text-theme_text_normal font-medium text-xl">
              Login as a Club
            </div>
          </button>
        </div>
      </div>*/}
      {/*<StudentLogin />*/}
      <div className="flex flex-col justify-center items-center h-screen p-3">
        <img
          src="/logo2.svg"
          alt="campus web"
          className="mx-auto w-[120px] md:w-[190px] h-auto mb-5"
        />
        <div className="theme_box_bg p-5 md:p-7 max-w-4xl mx-auto rounded-lg shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-lg md:text-xl font-bold text-theme_text_primary">
              🚨 TOP SECRET TRANSMISSION 🚨
            </div>
            
            <div className="text-red-500 font-mono text-sm md:text-base animate-pulse">
              🔒 CLASSIFIED: OPERATION TOUCH GRASS 🔒
            </div>
            
            <div className="text-theme_text_primary text-sm md:text-base leading-relaxed space-y-3">
              <p>
                🕵️ <strong>Agent Portal Status:</strong> TEMPORARILY OFFLINE 🕵️
              </p>
              
              <p>
                📋 <strong>Mission Brief:</strong> Our elite dev squad has been infiltrated by a mysterious organization called <em>"Real Life"</em> 
                🌳 They're currently undergoing intensive training in something called "work-life balance" (intelligence suggests it involves sunlight ☀️)
              </p>
              
              <p>
                🖥️ <strong>Server Status:</strong> Our databases are in witness protection after reporting exhaustion from processing too many student queries 😴
              </p>
              
              <p>
                📍 <strong>Current Location:</strong> Somewhere without WiFi signals... our agents are reportedly experiencing withdrawal symptoms 📶❌
              </p>
              
              <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg border-l-4 border-yellow-500">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ <strong>URGENT:</strong> This transmission will self-destruct when we remember our GitHub passwords 💥
                </p>
              </div>
              
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-4">
                🤖 Automated message from: <em>Definitely-Not-Panicking-Dev-Team-Bot-3000</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
