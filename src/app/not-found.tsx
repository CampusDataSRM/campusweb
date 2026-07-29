"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
const NotFound = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <div>
            <img src="/not-found.svg" alt="404" className="w-96 h-auto" />
        </div>
        <button
          type="submit"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              router.push("/student");
            }, 200);
          }}
          disabled={loading}
          className="z-10 bg-gradient-to-r from-theme_primary to-theme_secondary py-3 px-5 rounded-lg text-theme_text_normal w-48 text-center tracking-wider text-lg font-semibold"
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
            "Lost? Go Home"
          )}
        </button>
      </div>
    </>
  );
};

export default NotFound;
