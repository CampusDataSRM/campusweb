const TimetableCard = ({ subjectName, subjectType, classRoom, timing }) => {
  return (
    <>
      <div className={`${subjectName.includes("No class") ? "hidden" : ""} theme_box_bg px-4 py-6`}>
        <div className="w-full flex justify-between gap-3 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-base text-theme_text_normal tracking-wide font-semibold text-wrap">
              {subjectName}
            </span>
            <span className="text-sm text-theme_text_normal_60 font-semibold tracking-wide text-wrap">
              {classRoom}{" - "}{subjectType}
            </span>
          </div>
          <div className="flex flex-col gap-3 justify-center text-sm font-medium">
            <div className="theme_box_bg px-3 py-1 flex justify-center gap-2">
                <span className="text-theme_primary">ST</span>
                <span className="text-theme_text_normal">{timing && timing.split(" ")[0]}</span>
            </div>
            <div className="theme_box_bg px-3 py-1 flex justify-center gap-2">
                <span className="text-theme_green">ET</span>
                <span className="text-theme_text_normal">{timing && timing.split(" ")[2]}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-theme_primary/50 w-full h-[3px] rounded-full">
            <div
              className={`h-full bg-theme_green rounded-full`}
                style={{
                    width: `75%`,
                }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimetableCard;
