"use client";

import { useState, useEffect } from "react";
import { isAndroid } from "@/functions/device-check";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AndroidDeviceCheck = () => {
  const router = useRouter();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  useEffect(() => {
    setIsAndroidDevice(isAndroid());
    const timer = setTimeout(() => {
      if (isAndroid()) {
        window.location.href =
          "https://play.google.com/store/apps/details?id=com.campusweb.campusapp";
      }
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {" "}
      {isAndroidDevice &&
        !bannerDismissed &&
        !sessionStorage.getItem("androidAppBannerDismissed") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className=" backdrop-blur-xl bg-theme_primary/10 rounded-lg shadow-lg w-11/12 md:w-1/2">
              <button
                className="absolute top-3 right-3 text-white text-2xl font-extrabold px-3 py-1 rounded-full bg-red-700/60 transition duration-300"
                onClick={() => {
                  sessionStorage.setItem("androidAppBannerDismissed", true);
                  setBannerDismissed(true);
                }}
              >
                &times;
              </button>
              <Link href="https://play.google.com/store/apps/details?id=com.campusweb.campusapp">
                <img
                  src={`/assets/event/app_launch_banner.jpeg`}
                  alt="App Launch Banner"
                  className="w-full h-auto rounded-lg"
                />
              </Link>
            </div>
          </div>
        )}
    </>
  );
};

export default AndroidDeviceCheck;
