const DasbboardTimetableCard = ({
  subjectName,
  subjectType,
  classRoom,
  timing,
}) => {
  return (
    <>
      <div
        className={`${
          subjectName.includes("No class") ? "bg-[#0C4DA2]/20" : "bg-theme_primary/95"
        } px-2 py-[10px] rounded-lg text-base`}
      >
        <div className="w-full flex justify-start gap-3 items-center">
          <span className="text-theme_text_normal font-medium">
            {timing && timing.split(" ")[0]}
          </span>
          <span className="text-theme_text_normal tracking-wide font-medium text-nowrap truncate">
            {subjectName}
          </span>
        </div>
      </div>
    </>
  );
};

export default DasbboardTimetableCard;
