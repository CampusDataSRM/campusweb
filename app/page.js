"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authExpiry } from "@/functions/auth-expiry";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
      } else {
        router.push("/mobile/club/admin/dashboard");
      }
    }
  }, [router]);

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
    setLoading(true);
    e.preventDefault();
    console.log("Student Login", userid, password);
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
    setLoading(true);
    e.preventDefault();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: userid,
      password: password,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/auth/club-login",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          Cookies.set("clubAuth", result.token);
          router.push("/mobile/club/admin/dashboard");
        } else {
          alert("Invalid credentials");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

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
          <form
            className={studentLogin ? "grid grid-cols-1 gap-4 mt-3" : "hidden"}
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
                disabled={!loading}
                className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal w-full text-center tracking-wider text-lg font-semibold"
              >
                {loading ? (
                  <svg
                    class="animate-spin mx-auto h-7 w-7 text-white"
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
                      stroke-width="4"
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
          <form
            className={studentLogin ? "hidden" : "grid grid-cols-1 gap-4 mt-3"}
            name="Club Login Form"
          >
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
                disabled={loading}
                className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal w-full text-center tracking-wider text-lg font-semibold"
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
            <div className="text-center mt-5">
              <Link
                className="text-theme_text_primary font-medium hover:cursor-pointer"
                href={{
                  pathname: "/mobile/club/admin/form",
                  query: { type: "clubSignUp" },
                }}
              >
                New Club? Sign Up
              </Link>
            </div>
          </form>
          <div className="text-center mt-5">
            <button
              className="text-theme_text_primary font-medium hover:cursor-pointer"
              onClick={handleFormChange}
            >
              {studentLogin
                ? "Are you a club organiser?"
                : "Are you a student?"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
