import Link from "next/link";

const TeamCard = ({ name, caption, socials }) => {
  return (
    <>
      <div className="theme_box_bg px-4 py-6">
        <div className="flex gap-4 justify-start items-start">
          <img
            src={`/assets/team/${name}.jpg`}
            alt="team"
            className="w-[85px] h-[80px] rounded-lg"
          />
          <div className="flex flex-col gap-2">
            <span className="text-xl tracking-wider text-theme_text_normal">
              {name}
            </span>
            <span className="text-sm tracking-wide font-light text-theme_text_normal">
              {caption}
            </span>
          </div>
        </div>
        <div className="pt-5 flex justify-center items-center gap-5">
          {socials.map((social, index) => (
            <Link
              href={social.link}
              key={index}
              target="_blank"
              rel="noopener noreffer"
            >
              <img
                src={`/icons/${social.name}/primary.svg`}
                alt={social.name}
                className={
                  social.name.includes("githib")
                    ? "w-6 cursor-pointer"
                    : "w-7 cursor-pointer"
                }
              />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamCard;
