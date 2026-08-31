"use client";

import { useState, useEffect } from "react";
import { isIOS } from "@/functions/device-check";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IOSDeviceCheck = () => {
  const router = useRouter();
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [intentUrl, setIntentUrl] = useState("");
  useEffect(() => {
    setIsIOSDevice(isIOS());
    setIntentUrl(
      "https://apps.apple.com/in/app/campus-app-the-all-in-one/id6760725730",
    );
  }, []);

  return (
    <>
      {" "}
      {isIOSDevice &&
        !bannerDismissed &&
        !sessionStorage.getItem("iosAppBannerDismissed") && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className=" backdrop-blur-xl bg-theme_primary/10 rounded-lg shadow-lg w-10/12 md:w-1/2">
              <button
                className="absolute top-3 right-3 text-white text-2xl font-extrabold px-3 py-1 rounded-full bg-red-700/60 transition duration-300"
                onClick={() => {
                  sessionStorage.setItem("iosAppBannerDismissed", true);
                  setBannerDismissed(true);
                }}
              >
                &times;
              </button>
              <Link href={intentUrl}>
                <img
                  src={`/assets/event/app_launch_banner_ios.jpg`}
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

export default IOSDeviceCheck;
