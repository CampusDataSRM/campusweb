import Link from "next/link";
const ClubCard = ({ club, popularity }) => {
  return (
    <>
      <div className="w-full flex flex-col gap-5 theme_box_bg rounded-xl p-3">
        <div className="flex justify-between items-start gap-3 text-theme_text_normal font-light pb-3">
          <div className="grid grid-cols-1 gap-2 w-3/5">
            <div className="text-xl tracking-wider">
              {club?.name.toUpperCase()}
            </div>
            <div className="text-sm tracking-wide">{club?.description}</div>
          </div>
          <div className="">
            <img
              src={club?.logo}
              alt={club?.name}
              className="w-[70px] h-[70px] rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 -ml-1">
          {club?.isRecruiting && (
            <div
              name="Recruiting"
              className="theme_box_bg text-theme_primary font-bold text-sm px-3 py-1 rounded-full"
            >
              #Recruiting
            </div>
          )}
          {club?.labels &&
            club?.labels.map((tag, index) => (
              <div
                name={tag}
                key={index}
                className={`theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full`}
              >
                {tag}
              </div>
            ))}
        </div>
        <div className="flex justify-between items-end">
          <div className="text-base text-theme_text_primary">
            Popularity: {popularity}
            {" x "}
            <span className="text-yellow-300 text-lg">&#9734;</span>
          </div>
          <div className="text-base">
            <Link href={club?.websiteLink ? club?.websiteLink : ""}>
              <button className="bg-gradient-to-r from-theme_primary to-theme_secondary tracking-wider font-medium p-3 rounded-lg text-theme_text_normal">
                Explore
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubCard;
