"use client";
import { useRouter } from "next/navigation";
import StudentLogin from "@/app/client/login/student/page";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function Home() {
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
      <StudentLogin />
    </>
  );
}
