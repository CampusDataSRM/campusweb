"use client";

import { useState } from "react";

export default function Home() {

  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const [studentLogin, showStudentLogin] = useState(true);
  const handleFormChange = (e) => {
    showStudentLogin(!studentLogin);
    setUserid("");
    setPassword("");
  };

  const studentLoginFields = [
    {
      name: "SRM Email / Net ID",
      type: "text",
      placeholder: "SRM Email / Net ID",
      onChange: (e) => setUserid(e.target.value),
    },
    {
      name: "Password",
      type: "password",
      placeholder: "Password",
      onChange: (e) => setPassword(e.target.value),
    },
  ];
  const handleStudentLogin = (e) => {
    e.preventDefault();
    console.log("Student Login",userid, password);
  };

  const clubLoginFields = [
    {
      name: "Club username",
      type: "text",
      placeholder: "Club Email",
      onChange: (e) => setUserid(e.target.value),
    },
    {
      name: "Password",
      type: "password",
      placeholder: "Password",
      onChange: (e) => setPassword(e.target.value),
    },
  ];
  const handleClubLogin = (e) => {
    e.preventDefault();
    console.log("Club Login",userid, password);
  }

  return (
    <>
      <div className="flex flex-wrap justify-center page-center items-center gap-4 lg:gap-12">
        <div className="">
          <img
            src="/logo2.svg"
            alt="srmkzilla"
            className="mx-auto w-[350px] h-auto"
          />
        </div>
        <div className="w-[350px]">
          <form className={studentLogin ? "grid grid-cols-1 gap-4 mt-3" : "hidden"} name="Student Login Form">
            {studentLoginFields.map((field, index) => (
              <div key={index}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  onChange={field.onChange}
                  className="theme_box_bg drop-shadow-lg tracking-wider py-5 px-4 w-full text-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm placeholder:tracking-wide focus:border focus:border-theme_text_primary"
                />
              </div>
            ))}
            <div>
              <button
                type="submit"
                onClick={handleStudentLogin}
                className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal w-full text-center tracking-wider text-lg font-semibold"
              >
                Sign In
              </button>
            </div>
          </form>
          <form className={studentLogin ? "hidden" : "grid grid-cols-1 gap-4 mt-3"} name="Club Login Form">
            {clubLoginFields.map((field, index) => (
              <div key={index}>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  onChange={field.onChange}
                  className="theme_box_bg drop-shadow-lg tracking-wider py-5 px-4 w-full text-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm placeholder:tracking-wide focus:border focus:border-theme_text_primary"
                />
              </div>
            ))}
            <div>
              <button
                type="submit"
                onClick={handleClubLogin}
                className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal w-full text-center tracking-wider text-lg font-semibold"
              >
                Sign In
              </button>
            </div>
          </form>
          <div className="text-center mt-5">
            <button className="text-theme_text_primary font-medium hover:cursor-pointer" onClick={handleFormChange}>
              {studentLogin ? "Are you a club organiser?" : "Are you a student?"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
