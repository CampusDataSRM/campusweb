"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginLayout from "@/components/global/layout";

const StudentLogin = () => {
  useEffect(() => {
    if (Cookies.get("X-CSRF-Token")) {
      router.push("/student");
    }
  }, []);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const studentLoginFields = [
    {
      name: "SRM Email / Net ID",
      type: "text",
      placeholder: "SRM Email / Net ID",
      onChange: (e) => {
        if (e.target.value.includes("@")) setUserid(e.target.value);
        else setUserid(e.target.value + "@srmist.edu.in");
      },
    },
    {
      name: "Password",
      type: "password",
      placeholder: "Password",
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  const handleStudentLogin = (e) => {
    setLoading(true);
    e.preventDefault();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username: userid,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    fetch("https://campusapi-puce.vercel.app/api/auth/login/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (
          result.passResponse?.status_code === 201 &&
          result.Status &&
          result.Status === "success"
        ) {
          Cookies.set("X-CSRF-Token", result.Cookies);
          router.push("/student");
        } else {
          alert("Invalid credentials");
          setLoading(false);
        }
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      <LoginLayout>
        <form
          className={"grid grid-cols-1 gap-4 mt-3"}
          name="Student Login Form"
        >
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
              disabled={loading}
              className="z-10 bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal w-full text-center tracking-wider text-lg font-semibold"
            >
              {loading ? (
                <svg
                  className="animate-spin mx-auto h-7 w-7 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
        <div className="text-center mt-7">
          <Link
            className="text-theme_text_primary font-medium hover:cursor-pointer"
            href="/client/login/club"
          >
            Are you a Club Organiser ?
          </Link>
        </div>
      </LoginLayout>
    </>
  );
};

export default StudentLogin;
