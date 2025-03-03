"use client";
import { useSearchParams } from "next/navigation";
import LoginLayout from "@/components/global/layout";
import { useState } from "react";
import { toast } from "react-toastify";
import { sendResetPasswordEmail } from "@/functions/api/club";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
    const router = useRouter();
  const rawEmail = useSearchParams().get("email");
  const parsedEmail = rawEmail ? decodeURIComponent(rawEmail) : "";
  const [email, setEmail] = useState(parsedEmail);
  const [loading, setLoading] = useState(false);

  const handleSendResetToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    sendResetPasswordEmail(email).then((res) => {
      setLoading(false);
      if (res.status === "success") {
        toast.success(res.message);
        router.push("/client/login/club/forgot-password/reset");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <>
      <LoginLayout>
        <form
          className={"grid grid-cols-1 gap-4 mt-3"}
          name="Club Password Reset Form"
        >
          <div className="flex gap-1">
            <input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="theme_box_bg drop-shadow-lg tracking-wider py-5 px-4 w-full text-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm placeholder:tracking-wide focus:border focus:border-theme_text_primary"
            />
          </div>
          <div>
            <button
              type="submit"
              onClick={handleSendResetToken}
              disabled={email.length === 0 || loading}
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
                "Send Reset Token"
              )}
            </button>
          </div>
        </form>
      </LoginLayout>
    </>
  );
};
export default ForgotPassword;
