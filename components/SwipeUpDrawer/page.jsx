// "use client";

import React from "react";
import SettingsInDrawer from "./DrawerComponents/SettingsInDrawer";

const useClickOutside = (ref, callback) => {
  const handleClick = e => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};

export default function SwipeUpDrawer({
  isDrawer,
  setDrawer,
  currentDay,
  setCurrentDay,
  currentTime,
  setCurrentTime,
  setIsEditingMenu,
  messName,
  setMessName,
}) {

  const ref = React.useRef();
  useClickOutside(ref, () => {
    setDrawer(null);
  });
  
  return (
    <div
      className={`sticky bottom-0 h-auto overflow-hidden w-screen max-w-4xl ${
        isDrawer ? "z-40" : "z-20"
      }`}
      ref={ref}
    >
      <div
        className={`theme_box_bg backdrop-blur-md relative flex justify-center inset-x-0 items-center w-full max-w-4xl p-5 py-16 bottom-0 rounded-t-3xl  ${
          isDrawer ? "" : "translate-y-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {isDrawer == "settings" ? (
          <SettingsInDrawer setDrawer={setDrawer} currentDay={currentDay} setCurrentDay={setCurrentDay} currentTime={currentTime} setCurrentTime={setCurrentTime} messName={messName} setMessName={setMessName} />
        ) : null}
      </div>
    </div>
  );
}
