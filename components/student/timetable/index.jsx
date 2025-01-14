import { useEffect } from "react";
import { useState } from "react";

const TimetableCard = ({
  subjectName,
  subjectType,
  classRoom,
  timing,
  isCurrntDayOrder,
}) => {
  const [progressWidth, setProgressWidth] = useState(0);
  const calculateProgress = () => {
    if (!timing) return 0;

    const [startTime, , endTime] = timing.split(" ");

    const convertToMinutes = (time) => {
      let [hours, minutes] = time.split(":").map(Number);

      // Convert 12-hour format to 24-hour format based on time range
      if (hours < 8) {
        hours += 12; // Convert AM to PM for hours less than 8 (like 00:00 to 6:00 PM)
      }

      return hours * 60 + minutes;
    };

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    const currentIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentMinutes =
      new Date(currentIST).getHours() * 60 + new Date(currentIST).getMinutes();

    if (currentMinutes <= startMinutes) {
      return 0;
    } else if (currentMinutes >= endMinutes) {
      return 100;
    } else {
      return (
        ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100
      );
    }
  };

  // const progressWidth = calculateProgress();

  useEffect(() => {
    setProgressWidth(calculateProgress());
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setProgressWidth(calculateProgress());
      console.log("Progress Width", progressWidth);
    }, 1000 * 60);
  }, [progressWidth]);

  return (
    <>
      <div
        className={`${
          subjectName.includes("No class") ? "hidden" : ""
        } theme_box_bg px-4 py-6`}
      >
        <div className="w-full flex justify-between gap-3 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-base text-theme_text_normal tracking-wide font-semibold text-wrap">
              {subjectName}
            </span>
            <span className="text-sm text-theme_text_normal_60 font-semibold tracking-wide text-wrap">
              {classRoom.toUpperCase()}
              {" - "}
              {subjectType}
            </span>
          </div>
          <div className="flex flex-col gap-3 justify-center text-sm font-medium">
            <div className="theme_box_bg px-3 py-1 flex justify-center gap-2">
              <span className="text-theme_primary">ST</span>
              <span className="text-theme_text_normal">
                {timing && timing.split(" ")[0]}
              </span>
            </div>
            <div className="theme_box_bg px-3 py-1 flex justify-center gap-2">
              <span className="text-theme_green">ET</span>
              <span className="text-theme_text_normal">
                {timing && timing.split(" ")[2]}
              </span>
            </div>
          </div>
        </div>
        {progressWidth != 0 && isCurrntDayOrder && (
          <div className="mt-4">
            <div className="bg-theme_primary/50 w-full h-[3px] rounded-full">
              <div
                className={`h-full bg-theme_green rounded-full`}
                style={{
                  width: `${progressWidth}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TimetableCard;
