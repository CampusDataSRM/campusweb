const ClubCard = ({ club, tags, popularity }) => {
  const tagColor = (tag) => {
    if (tag.toLowerCase().includes("recruiting")) {
      return "theme_text_primary font-bold";
    } else {
      return "theme_text_primary";
    }
  };
  return (
    <>
      <div className="max-w-[350px] theme_box_bg rounded-xl px-3 py-3">
        <div className="flex justify-between gap-3 text-theme_text_normal font-light">
          <div className="grid grid-cols-1 gap-2 my-auto">
            <div className="text-xl tracking-wider">{club.name.toUpperCase()}</div>
            <div className="text-sm tracking-wide">{club.description}</div>
          </div>
          <div className="my-auto p-2">
            <img
              src={club.logo}
              alt={club.name}
              className="w-96 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {tags.map((tag, index) => (
            <div
              name={tag.type}
              key={index}
              className={`theme_box_bg text-${tagColor(
                tag.value
              )} text-sm px-3 py-1 rounded-full`} 
            >
              {tag.value}
            </div>
          ))}
        </div>
        <div className="text-base text-theme_text_primary mt-3">
          Popularity: {popularity}{" x "}
          <span className="text-yellow-300 text-lg">&#9734;</span>
        </div>
      </div>
    </>
  );
};

export default ClubCard;