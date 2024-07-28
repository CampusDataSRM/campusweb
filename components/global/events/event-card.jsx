import Link from "next/link";

const EventCard = ({ event, club }) => {
  return (
    <>
      <div className="max-w-[350px] w-full theme_box_bg rounded-xl">
        <div>
          <img src={event.banner_url} alt={event.title} className="rounded-t-xl w-full" />
        </div>
        <div className="flex justify-between px-3 mt-3 tracking-wider">
          <div className="grid grid-cols-1 text-theme_text_normal my-auto">
            <div>{event.title}</div>
            <div className="text-theme_text_normal_60">by {String(club.name).toUpperCase()}</div>
          </div>
          <div className="w-[50px] h-[50px] my-auto">
            <img src={club.logo} alt={club.name} className="rounded-lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 px-2 mt-3">
          {event.labels.map((value, index) => (
            <div
              name={value}
              key={index}
              className="theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full"
            >
              {value}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-2 py-3">
          <div className="text-base text-theme_text_primary my-auto">
            Popularity: {event.popularity}{" "}
            <span className="text-yellow-300 text-lg">&#9734;</span>
          </div>
          <div className="text-base">
            <Link href={event.website_link}>
              <button className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal">
                Register
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCard;