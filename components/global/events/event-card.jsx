import Link from "next/link";

const EventCard = ({ event, club, tags, popularity }) => {
  return (
    <>
      <div className="max-w-[350px] theme_box_bg rounded-xl">
        <div>
          <img src={event.image} alt={event.name} className="rounded-t-xl" />
        </div>
        <div className="flex justify-between px-3 mt-2 tracking-wider">
          <div className="grid grid-cols-1 text-theme_text_normal my-auto">
            <div>{event.name}</div>
            <div className="text-theme_text_normal_60">by {club.name.toUpperCase()}</div>
          </div>
          <div className="w-[50px] h-[50px] my-auto">
            <img src={club.logo} alt={club.name} className="rounded-lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 px-2 mt-3">
          {tags.map((tag, index) => (
            <div
              name={tag.type}
              key={index}
              className="theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full"
            >
              {tag.value}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-2 py-3">
          <div className="text-base text-theme_text_primary my-auto">
            Popularity: {popularity}{" "}
            <span className="text-yellow-300 text-lg">&#9734;</span>
          </div>
          <div className="text-base">
            <Link href={event.link}>
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