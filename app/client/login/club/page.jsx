"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authExpiry } from "@/functions/auth-expiry";
import LoginLayout from "@/components/global/layout";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";

const ClubLogin = () => {
  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
      } else {
        router.push("/club/admin/dashboard");
      }
    }
  }, []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const clubLoginFields = [
    {
      name: "Club username",
      type: "text",
      placeholder: "Club Email",
      onChange: (e) => setUserid(e.target.value.trim()),
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
      mode: "cors",
    };

    fetch(`${baseURL}/api/auth/club-login`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          Cookies.set("clubAuth", result.token, { expires: 2 });
          Cookies.set("clubLoggedIn", true, { expires: 365 });
          router.push("/club/admin/dashboard");
        } else {
          if (result.status === "fail") {
            toast.error(result.message);
            setLoading(false);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <>
      <LoginLayout>
        <form className={"grid grid-cols-1 gap-4 mt-3"} name="Club Login Form">
          {clubLoginFields.map((field, index) => (
            <div key={index} className="flex gap-1">
              <input
                type={
                  field.type == "password" && passwordVisible
                    ? "text"
                    : field.type
                }
                placeholder={field.placeholder}
                onChange={field.onChange}
                className="theme_box_bg drop-shadow-lg tracking-wider py-5 px-4 w-full text-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm placeholder:tracking-wide focus:border focus:border-theme_text_primary"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setPasswordVisible(!passwordVisible);
                }}
                className={
                  field.type == "password" ? "theme_box_bg px-4" : "hidden"
                }
                type="button"
              >
                {passwordVisible ? (
                  <img
                    src="/icons/visiblity/secondary/off.svg"
                    className="w-5"
                  />
                ) : (
                  <img
                    src="/icons/visiblity/secondary/on.svg"
                    className="w-5"
                  />
                )}
              </button>
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
          <div className="text-center mt-5 flex flex-col gap-5">
            <Link
              className="text-theme_text_primary font-medium hover:cursor-pointer"
              href={{
                pathname: "/client/login/club/forgot-password",
                query: { email: userid },
              }}
            >
              Forgot Password?
            </Link>
            <Link
              className="text-theme_text_primary font-medium hover:cursor-pointer"
              href={{
                pathname: "/client/signup/club",
                query: { type: "clubSignUp" },
              }}
            >
              New Club? Sign Up
            </Link>
          </div>
        </form>
        <div className="text-center mt-5">
          <Link
            className="text-theme_text_primary font-medium hover:cursor-pointer"
            href="/client/login/student"
          >
            Are you a Student ?
          </Link>
        </div>
      </LoginLayout>
    </>
  );
};

export default ClubLogin;
