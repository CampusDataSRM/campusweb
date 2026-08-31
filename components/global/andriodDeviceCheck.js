"use client";

import { useState, useEffect } from "react";
import { isAndroid } from "@/functions/device-check";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AndroidDeviceCheck = () => {
  const router = useRouter();
  const [isAndroidDevice, setIsAndroidDevice] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [intentUrl, setIntentUrl] = useState("");
  useEffect(() => {
    setIsAndroidDevice(isAndroid());
    const manifestScheme = "https";
    const host = "campusweb.vercel.app";
    const packageId = "com.campusweb.campusapp";
    const fallbackUrl = `https://play.google.com/store/apps/details?id=${packageId}`;

    // Construct the Intent URL
    const intentUrl = `intent://${host}/#Intent;scheme=${manifestScheme};package=${packageId};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end;`;
    const timer = setTimeout(() => {
      if (isAndroid()) {
        // INTENT URL STRUCTURE:
        // intent://<URL_PATH>#Intent;scheme=<YOUR_SCHEME>;package=<YOUR_PACKAGE_ID>;S.browser_fallback_url=<PLAY_STORE_URL>;end;
        // For your HTTPS scheme (since we use https://campusweb.vercel.app as the scheme in manifest):
        // The "scheme" is https, and the path is / (root).
        // window.location.href = intentUrl; Suspended for now - Auto redirect is stopped
      }
    }, 2000);
    return () => clearTimeout(timer);
    setIntentUrl(intentUrl);
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
              <Link href={intentUrl}>
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
