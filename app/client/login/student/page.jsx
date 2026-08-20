"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginLayout from "@/components/global/layout";
import { baseURL } from "@/constants/baseURL";
import { toast } from "react-toastify";

const StudentLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [captchaContent, setCaptchaContent] = useState("");

  useEffect(() => {
    if (Cookies.get("X-CSRF-Token")) {
      router.push("/student");
    }
  }, [router]);

  const studentLoginFields = [
    {
      name: "SRM Email / Net ID",
      type: "text",
      placeholder: "SRM Email / Net ID",
      onChange: (e) => {
        if (e.target.value.includes("@")) setUserid(e.target.value.trim());
        else setUserid(e.target.value.trim() + "@srmist.edu.in");
      },
    },
    {
      name: "Password",
      type: "password",
      placeholder: "Password",
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      username: userid,
      password: password,
      ...(captcha && {
        captcha_content: captchaContent.trim(),
        captcha_digest: captcha.digest,
      }),
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
      mode: "cors",
    };

    try {
      const response = await fetch(`${baseURL}/api/auth/login/`, requestOptions);
      const result = await response.json().catch(() => ({}));
      if (result?.captcha_required) {
        setCaptcha({
          digest: result.captcha_digest,
          imageUrl: result.image_url,
        });
        setCaptchaContent("");
        toast.info("Complete the CAPTCHA to continue.");
        return;
      }
      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.Message ||
            result?.errors?.[0]?.message ||
            "Student login failed"
        );
      }

        // ✅ Handle both lowercase and uppercase keys safely
      if (
        (result.passResponse?.status_code === 201 ||
          result.status === "success" ||
          result.Status === "success") &&
        (result.cookies || result.Cookies)
      ) {
        const csrfToken =
          result.Cookies ||
          result.cookies ||
          result.COOKIE ||
          result.cookie ||
          result["X-CSRF-Token"];

        if (csrfToken) {
          Cookies.set("X-CSRF-Token", csrfToken, { expires: 365 });
          localStorage.setItem(
            "studentNetId",
            userid.trim().split("@")[0].toLowerCase()
          );
          setCaptcha(null);
          router.push("/student");
        } else {
          throw new Error("Login succeeded but the session cookie was missing.");
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      if (error?.message === "Too many requests, slow down!") {
        toast.error("Too many requests, slow down! Try again after 60 seconds.");
      } else {
        toast.error(error?.message || "Could not reach the login service");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleStudentLogin(e);
    }
  };

  return (
    <>
      <LoginLayout>
        <form
          className="grid grid-cols-1 gap-4 mt-3"
          name="Student Login Form"
          onKeyDown={handleKeyDown}
        >
          {studentLoginFields.map((field, index) => (
            <div key={index} className="flex gap-1">
              <input
                type={
                  field.type === "password" && passwordVisible
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
                  field.type === "password" ? "theme_box_bg px-4" : "hidden"
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

          {captcha && (
            <div className="grid gap-3">
              <img
                src={captcha.imageUrl}
                alt="Academia CAPTCHA"
                className="theme_box_bg min-h-16 w-full rounded-md object-contain p-2"
              />
              <input
                type="text"
                value={captchaContent}
                onChange={(event) => setCaptchaContent(event.target.value)}
                placeholder="Enter CAPTCHA"
                autoComplete="off"
                className="theme_box_bg w-full px-4 py-4 tracking-wider text-theme_text_primary placeholder:text-sm placeholder:text-theme_text_primary"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              onClick={handleStudentLogin}
              disabled={loading || (captcha && !captchaContent.trim())}
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
