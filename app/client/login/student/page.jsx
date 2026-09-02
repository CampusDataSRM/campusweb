"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginLayout from "@/components/global/layout";
import {
  baseURL,
  baseURL_1,
  baseURL_2,
  baseURL_3,
  baseURL_4,
  baseURL_5,
  baseURL_6,
  baseURL_7,
  baseURL_8,
  baseURL_9,
} from "@/constants/baseURL";
import { toast } from "react-toastify";
import { isAndroid, isIOS } from "@/functions/device-check";
import { getStudentData, loginStudentPortal } from "@/functions/api/student";
import {
  DEMO_NET_ID,
  DEMO_SESSION,
  getDemoStudent,
  loginDemo,
} from "@/functions/demo/student-demo";
import {
  usesStudentPortalPrimary,
} from "@/functions/auth/student-login-routing.mjs";

const STUDENT_PORTAL_SESSION_MARKER = "sp_session=http_only";
const normalizedNetId = (value) => value.trim().split("@")[0].toLowerCase();

const StudentLogin = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showPlayStoreBadge, setShowPlayStoreBadge] = useState(false);
  const [showAppStoreBadge, setShowAppStoreBadge] = useState(false);

  useEffect(() => {
    if (Cookies.get("X-CSRF-Token")) {
      router.push("/student");
    }
    setShowPlayStoreBadge(isAndroid());
    setShowAppStoreBadge(isIOS());
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

  // Fisher-Yates shuffle algorithm for randomizing array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const baseURLS = [
    baseURL,
    baseURL_1,
    baseURL_2,
    baseURL_3,
    baseURL_4,
    baseURL_5,
    baseURL_6,
    baseURL_7,
    baseURL_8,
    baseURL_9,
  ];

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    localStorage.setItem("net_id", userid);

    try {
      const netId = normalizedNetId(userid);
      if (!netId || !password) {
        throw new Error("NetID and password are required.");
      }

      if (netId === DEMO_NET_ID) {
        await loginDemo(netId, password);
        const demoStudent = await getDemoStudent();
        Cookies.set("X-CSRF-Token", DEMO_SESSION, { sameSite: "strict" });
        localStorage.setItem("studentNetId", DEMO_NET_ID);
        localStorage.setItem("studentData", JSON.stringify(demoStudent));
        setPassword("");
        router.push("/student");
        return;
      }

      localStorage.removeItem("campuswebDemo");

      const academiaController = new AbortController();
      const academiaAttempt = (async () => {
        let remainingURLs = shuffleArray(baseURLS);
        let lastError = new Error("Academia is temporarily unavailable.");
        while (remainingURLs.length > 0) {
          const currentURL = remainingURLs[0];
          try {
            const response = await fetch(`${currentURL}/api/auth/login/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: userid, password }),
              redirect: "follow",
              mode: "cors",
              cache: "no-store",
              signal: academiaController.signal,
            });
            const result = await response.json().catch(() => ({}));
            const definitive =
              response.ok ||
              response.status === 401 ||
              result?.code === "academia_credentials_rejected" ||
              result?.passResponse?.message === "Matched with old password";
            if (definitive) return { response, result };
            lastError = new Error(result?.message || lastError.message);
          } catch (error) {
            if (academiaController.signal.aborted) {
              return { error: new Error("Academia check cancelled") };
            }
            lastError = error;
          }
          remainingURLs = shuffleArray(remainingURLs.slice(1));
        }
        return { error: lastError };
      })();

      const studentPortalAttempt = loginStudentPortal(netId, password)
        .then((result) => ({ result }))
        .catch((error) => ({ error }));

      let firstCompleted = await Promise.race([
        academiaAttempt.then((attempt) => ({ source: "academia", attempt })),
        studentPortalAttempt.then((attempt) => ({
          source: "studentPortal",
          attempt,
        })),
      ]);

      const finishAcademia = (attempt) => {
        const response = attempt?.response;
        const result = attempt?.result || {};
        if (
          result?.passResponse?.message === "Matched with old password" ||
          result?.code === "P201"
        ) {
          throw new Error(
            "You've entered an old password. Please enter your current password.",
          );
        }
        const csrfToken =
          result.Cookies ||
          result.cookies ||
          result.COOKIE ||
          result.cookie ||
          result["X-CSRF-Token"];
        if (!response?.ok || !csrfToken) {
          throw new Error(
            result?.message || attempt?.error?.message || "Student login failed",
          );
        }
        Cookies.set("X-CSRF-Token", csrfToken, { expires: 365 });
        localStorage.setItem("studentNetId", netId);
        setPassword("");
        router.push("/student");
      };

      if (firstCompleted.source === "academia") {
        const earlyResult = firstCompleted.attempt?.result || {};
        const earlyCookie = earlyResult.Cookies || earlyResult.cookies;
        if (firstCompleted.attempt?.response?.ok && earlyCookie) {
          const quickStudentPortal = await Promise.race([
            studentPortalAttempt,
            new Promise((resolve) => setTimeout(() => resolve(null), 750)),
          ]);
          if (
            quickStudentPortal?.result &&
            usesStudentPortalPrimary(quickStudentPortal.result)
          ) {
            firstCompleted = {
              source: "studentPortal",
              attempt: quickStudentPortal,
            };
          } else {
            finishAcademia(firstCompleted.attempt);
            return;
          }
        }
      }

      const studentPortal =
        firstCompleted.source === "studentPortal"
          ? firstCompleted.attempt
          : await studentPortalAttempt;
      if (
        studentPortal?.result &&
        usesStudentPortalPrimary(studentPortal.result)
      ) {
        // First-year authentication is complete. Stop further Academia
        // retries and never use its failure as the login result.
        academiaController.abort();
        Cookies.set("X-CSRF-Token", STUDENT_PORTAL_SESSION_MARKER, {
          expires: 30,
          sameSite: "strict",
          secure: window.location.protocol === "https:",
        });
        localStorage.setItem("studentNetId", netId);
        const snapshot = await getStudentData(
          STUDENT_PORTAL_SESSION_MARKER,
          netId,
        );
        if (snapshot?.message !== "success" || !snapshot?.content) {
          throw new Error(
            "Student Portal login succeeded, but student data could not be loaded.",
          );
        }
        localStorage.setItem("studentData", JSON.stringify(snapshot.content));
        setPassword("");
        router.push("/student");
        return;
      }

      finishAcademia(await academiaAttempt);
    } catch (error) {
      toast.error(error?.message || "Could not reach the login service");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleStudentLogin(e);
    }
  };

  const PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.campusweb.campusapp";

  
  const APP_STORE_URL =
    "https://apps.apple.com/in/app/campus-app-the-all-in-one/id6760725730";

  const playStoreBadge = !showPlayStoreBadge ? null : (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      id="playstore-badge"
      className="group block relative overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 148, 255, 0.15), rgba(151, 71, 255, 0.15))",
        border: "1px solid rgba(0, 148, 255, 0.3)",
      }}
    >
      {/* Shimmer sweep animation */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      <div className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4">
        <div className="relative flex-shrink-0">
          {/* Google Play Icon */}
          <svg
            viewBox="0 0 512 512"
            className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg"
            fill="none"
          >
            <defs>
              <linearGradient id="playGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C3FF" />
                <stop offset="100%" stopColor="#0094FF" />
              </linearGradient>
              <linearGradient id="playGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFCE00" />
                <stop offset="100%" stopColor="#FF9100" />
              </linearGradient>
              <linearGradient id="playGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF3A44" />
                <stop offset="100%" stopColor="#C31162" />
              </linearGradient>
              <linearGradient id="playGrad4" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#32A071" />
                <stop offset="100%" stopColor="#2DA94F" />
              </linearGradient>
            </defs>
            <path
              d="M93.72 22.4c-10.8 0-20.72 8.64-20.72 22.4v422.4c0 13.76 9.92 22.4 20.72 22.4 4.16 0 8.64-1.28 13.12-4.16l196.48-113.44-68.8-68.8L93.72 22.4z"
              fill="url(#playGrad3)"
            />
            <path
              d="M404.88 218.24l-101.76-58.72-76.8 76.8 76.8 76.8 101.76-58.72c17.6-10.24 17.6-26.88 0-36.16z"
              fill="url(#playGrad1)"
            />
            <path
              d="M106.84 467.84c-4.48 2.88-8.96 4.16-13.12 4.16L303.12 236.32l-76.8-76.8L106.84 467.84z"
              fill="url(#playGrad4)"
            />
            <path
              d="M303.12 236.32L93.72 22.4c4.16 0 8.64 1.28 13.12 4.16L303.12 159.52l-76.8 76.8h76.8z"
              fill="url(#playGrad2)"
            />
          </svg>
        </div>

        {/* Text content */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-theme_text_primary font-semibold">
            Also available on
          </span>
          <span className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
            Google Playstore
          </span>
        </div>

        {/* Arrow icon */}
        <div className="ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 text-theme_text_primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Bottom gradient accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: "linear-gradient(90deg, #0094FF, #9747FF, #0094FF)",
        }}
      />
    </a>
  );

  const appStoreBadge = !showAppStoreBadge ? null : (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      id="appstore-badge"
      className="group block relative overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 148, 255, 0.15), rgba(151, 71, 255, 0.15))",
        border: "1px solid rgba(0, 148, 255, 0.3)",
      }}
    >
      {/* Shimmer sweep animation */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      <div className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4">
        <div className="relative flex-shrink-0">
          {/* Apple App Store Icon */}
          <img
            src="/icons/apple_ios.png"
            alt="Apple App Store"
            className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg"
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-theme_text_primary font-semibold">
            Also available on
          </span>
          <span className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
            Apple App Store
          </span>
        </div>

        {/* Arrow icon */}
        <div className="ml-auto flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 sm:w-6 sm:h-6 text-theme_text_primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Bottom gradient accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: "linear-gradient(90deg, #0094FF, #9747FF, #0094FF)",
        }}
      />
    </a>
  );

  return (
    <>
      <LoginLayout topBanner={isAndroid() ? playStoreBadge : isIOS() ? appStoreBadge : null}>
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
