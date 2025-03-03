"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoginLayout from "@/components/global/layout";
import { baseURL } from "@/constants/baseURL";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

const ResetPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);
  const [club, setClub] = useState({
    resetToken: "",
    password: "",
    confirmPassword: "",
  });

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setClub({ ...club, [name]: value });
    if (name === "password") {
      setPasswordLength(value.length);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      password: club.password,
      passwordConfirm: club.confirmPassword,
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${baseURL}/api/auth/resetpassword/${club.resetToken}`,
        requestOptions
      );
      const result = await response.json();
      if (result.status === "success") {
        toast.success(result.message);
        router.push("/client/login/club");
      } else {
        toast.error(result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <LoginLayout>
        <form
          className={"grid grid-cols-1 gap-4 mt-3"}
          name="Club Password Reset Form"
        >
          <input
            type="text"
            placeholder="Reset Token (sent in mail) (required)"
            className={`${defaultStyle}`}
            name="resetToken"
            onChange={onFormChange}
            required
          />
          <div className="flex gap-1">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password (required)"
              className={`${defaultStyle} flex-grow`}
              name="password"
              onChange={onFormChange}
              required
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setPasswordVisible(!passwordVisible);
              }}
              className="theme_box_bg py-3 px-4"
            >
              {passwordVisible ? (
                <img src="/icons/visiblity/secondary/off.svg" className="w-5" />
              ) : (
                <img src="/icons/visiblity/secondary/on.svg" className="w-5" />
              )}
            </button>
          </div>
          {passwordLength > 0 && passwordLength < 8 && (
            <div className="flex gap-2 px-1">
              <img src="/icons/warning/red-nofill.svg" className="w-4" />
              <span className="text-theme_red text-sm font-medium tracking-wider">
                Password must be atleast 8 characters long
              </span>
            </div>
          )}
          <input
            type="password"
            placeholder="Confirm Password (required)"
            className={`${defaultStyle}`}
            name="confirmPassword"
            onChange={onFormChange}
            required
          />
          {club.confirmPassword.length > 0 &&
            club.password != club.confirmPassword && (
              <div className="flex gap-2 px-1">
                <img src="/icons/warning/red-nofill.svg" className="w-4" />
                <span className="text-theme_red text-sm font-medium tracking-wider">
                  The confirm password does not match
                </span>
              </div>
            )}
          <div>
            <button
              type="submit"
              onClick={handleResetPassword}
              disabled={
                club.confirmPassword != club.password ||
                passwordLength < 8 ||
                loading
              }
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
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </LoginLayout>
    </>
  );
};
export default ResetPassword;
