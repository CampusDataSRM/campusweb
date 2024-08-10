import { clubData } from "@/components/global/club/data";
import ClubCard from "@/components/global/club/club-card";

const Club = () => {
  return (
    <>
      <div className="text-2xl text-theme_text_primary px-6 py-3">Clubs</div>
        <div className="flex flex-wrap justify-center gap-4 px-3 py-2">
            {clubData.map((club, index) => (
            <ClubCard key={index} {...club} />
            ))}
        </div>
    </>
  );
};

export default Club;