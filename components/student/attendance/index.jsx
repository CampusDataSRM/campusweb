const AttendanceCard = ({ attendance }) => {
  const attendanceColor = (margin, required) => {
    if (margin > required) {
      return { color: "theme_green", value: margin, label: "Margin" };
    } else if (margin == required) {
      return { color: "theme_primary", value: margin, label: "Margin" };
    } else {
      return { color: "theme_red", value: required, label: "Required" };
    }
  };
  return (
    <>
      <div className="px-3 py-5 w-full theme_box_bg">
        <div className="flex gap-3 justify-between items-end">
          <div className="flex flex-col gap-1 justify-start">
            <span className="text-base font-normal text-theme_text_normal tracking-wide text-wrap">
              {attendance?.courseTitle}
            </span>
            <span className="text-theme_text_normal_60 text-sm">
              {String(attendance?.courseCode).replace("Regular", "")}{" - "}{attendance?.category}
            </span>
            <div className="flex gap-3 items-center text-xs mt-2">
              <span className="theme_box_bg flex gap-3 rounded-full py-1 px-3">
                <span className="text-theme_green">P</span>
                <span className="text-theme_text_normal">
                  {attendance?.hoursPresent}
                </span>
              </span>
              <span className="theme_box_bg flex gap-3 rounded-full py-1 px-3">
                <span className="text-theme_red">A</span>
                <span className="text-theme_text_normal">
                  {attendance?.hoursAbsent}
                </span>
              </span>
              <span className="theme_box_bg flex gap-3 rounded-full py-1 px-3">
                <span className="text-theme_primary">T</span>
                <span className="text-theme_text_normal">
                  {attendance?.hoursConducted}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <span
              className={`text-3xl text-${
                attendanceColor(attendance?.margin, attendance?.required).color
              } font-semibold text-center`}
            >
              {attendanceColor(attendance?.margin, attendance?.required).value}
            </span>
            <span
              className={`text-${
                attendanceColor(attendance?.margin, attendance?.required).color
              } text-sm text-center tracking-wide`}
            >
              {attendanceColor(attendance?.margin, attendance?.required).label}
            </span>
            <span className="text-theme_primary text-[15px] font-bold text-nowrap text-center mt-3">
              {attendance?.attendancePercent} %
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-theme_primary/50 w-full h-[3px] rounded-full">
            <div
              className={`h-full rounded-full`}
                style={{
                    width: `${attendance?.attendancePercent}%`,
                    backgroundColor: `${attendance?.attendancePercent > 75 ? "#00FF38" : "#FF0000"}`,
                }}
            ></div>
          </div>
          <div className="bg-theme_primary h-4 w-1 relative left-[75%] -mt-[10px] rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default AttendanceCard;
