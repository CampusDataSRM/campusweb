"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toTitleCase } from "@/functions/title-case-convert";
import Cookies from "js-cookie";
import Link from "next/link";
import { authExpiry } from "@/functions/auth-expiry";
import SectionTitle from "@/components/global/section-title";
import { baseURL } from "@/constants/baseURL";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

const UpdatePassword = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [club, setClub] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
        router.push("/client/login/club");
      }
    } else {
      router.push("/client/login/club");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

    const raw = JSON.stringify({ 
      currentPassword: club.currentPassword,
      NewPassword: club.newPassword,
      PasswordConfirm: club.confirmNewPassword,
     });

    const requestOptions = {
      method: "POST",
      body: raw,
      headers: myHeaders, 
      redirect: "follow",
    };

    fetch(
      `${baseURL}/api/users/updatepassword`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        alert(result.message);
        setSubmitting(false);
        setClub({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      })
      .catch((error) => console.error(error));
  };

  const onFormChange = (e) => {
    setClub({ ...club, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="">
        <form className="grid grid-cols-1 -mt-2 gap-3">
          <input
            type="password"
            placeholder="Current Password"
            className={`${defaultStyle}`}
            name="currentPassword"
            onChange={onFormChange}
            value={club.currentPassword}
          />
          <input
            type="password"
            placeholder="New Password"
            className={`${defaultStyle}`}
            name="newPassword"
            onChange={onFormChange}
            value={club.newPassword}
            required
          />
          <input
            type="Password"
            placeholder="Confirm New Password"
            className={`${defaultStyle}`}
            name="confirmNewPassword"
            onChange={onFormChange}
            value={club.confirmNewPassword}
          />
          <button
            type="button"
            className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-semibold tracking-wide"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
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
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdatePassword;
