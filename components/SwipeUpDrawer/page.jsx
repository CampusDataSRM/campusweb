// "use client";

import React from "react";
import SettingsInDrawer from "./DrawerComponents/SettingsInDrawer";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const useClickOutside = (ref, callback) => {
  const handleClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};

export default function SwipeUpDrawer({
  isDrawer,
  setDrawer = () => {},
  currentDay = "",
  setCurrentDay = () => {},
  currentTime = "",
  setCurrentTime = () => {},
  setIsEditingMenu = () => {},
  messName = "",
  setMessName = () => {},
  studentPageLink = [],
  items = [],
}) {
  const router = useRouter();

  const ref = React.useRef();
  useClickOutside(ref, () => {
    setDrawer(null);
  });

  const handleLogout = () => {
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("https://campusapi-puce.vercel.app/api/auth/logout/", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        localStorage.removeItem("studentData");
        Cookies.remove("X-CSRF-Token");
        router.push("/");
        console.log(result);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div
      className={`sticky bottom-0 h-auto overflow-hidden w-screen max-w-4xl ${
        isDrawer ? "z-50" : "-z-50"
      }`}
      ref={ref}
    >
      <div
        className={`theme_box_bg backdrop-blur-md relative flex justify-center inset-x-0 items-center w-full max-w-4xl p-5 py-16 bottom-0 rounded-t-3xl  ${
          isDrawer ? "" : "translate-y-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        {isDrawer == "settings" ? (
          <SettingsInDrawer
            setDrawer={setDrawer}
            currentDay={currentDay}
            setCurrentDay={setCurrentDay}
            currentTime={currentTime}
            setCurrentTime={setCurrentTime}
            messName={messName}
            setMessName={setMessName}
          />
        ) : isDrawer == "nav" ? (
          <div className="grid grid-cols-2 gap-[8px] mt-4 px-4">
            {studentPageLink
              .filter((entity) => items?.includes(entity.name))
              .map((item, index) => (
                <button
                  key={index}
                  onClick={
                    item.name === "Logout"
                      ? handleLogout
                      : () => router.push(item.link)
                  }
                  className="flex justify-stretch py-4 px-2 bg-theme_primary/10 rounded-md gap-4 items-center"
                >
                  <img src={item.icon} alt={item.name} className="h-5 w-auto" />
                  <span className="text-white font-medium">{item.name}</span>
                </button>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
