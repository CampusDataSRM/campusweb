import Link from "next/link";
import { useState } from "react";
import Cookies from "js-cookie";
import { baseURL } from "@/constants/baseURL";

const ClubCard = ({ club, visitLinkActive, clubID, checkLiked }) => {
  const [clubPopularity, setClubPopularity] = useState(
    club?.popularity ? club?.popularity : 0
  );
  const [userClicked, setUserClicked] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(checkLiked);

  const actionLikeUnlike = () => {
    setUserClicked(true);
    const myHeaders = new Headers();
    if (currentStatus) {
      myHeaders.append("action", "unlike");
    } else {
      myHeaders.append("action", "like");
    }
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));
    myHeaders.append("clubid", clubID);

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `${baseURL}/api/users/clubaction/`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setUserClicked(false);
        if (currentStatus) {
          setClubPopularity(clubPopularity - 1);
        } else {
          setClubPopularity(clubPopularity + 1);
        }
        setCurrentStatus(!currentStatus);
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      <div className={club?.name.includes("TCW-20240916") || !club?.verified ? "hidden" : "w-full flex flex-col gap-3 theme_box_bg rounded-xl p-3"}>
        <div className="flex justify-between items-start gap-4 text-theme_text_normal font-light pb-3">
          <div className="grid grid-cols-1 gap-2 w-3/4">
            <div className="text-xl tracking-wider font-bold">
              <div className="">
                <span>{club?.name}</span>
                {club?.verified && (
                  <img
                    src="/icons/verified/green.svg"
                    alt="Verified"
                    className="w-5 h-auto ml-2 inline-block -mt-1"
                  />
                )}
              </div>
            </div>
            <div className="text-sm tracking-wide pr-6">
              {club?.description}
            </div>
          </div>
          <div className="">
            <img
              src={club?.logo}
              alt={club?.name}
              className="w-[72px] h-[72px] rounded-lg"
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
                key={index+club.name}
                className={
                  tag.length == 0
                    ? `hidden`
                    : `theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full`
                }
              >
                {tag}
              </div>
            ))}
        </div>
        <div className={`flex justify-between items-end ${club?.websiteLink ? '' : 'mt-3'}`}>
          <div className="text-base text-theme_text_primary flex items-center">
            <span>Popularity: {clubPopularity}</span>
            <span className="italic">x</span>
            <button
              className="pl-1"
              onClick={actionLikeUnlike}
              disabled={userClicked}
            >
              {userClicked ? (
                <>
                  <svg
                    className="animate-spin mx-auto h-5 w-5 text-theme_primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : (
                <>
                  {" "}
                  {currentStatus ? (
                    <img src="/icons/star/gold-solid.svg" alt="Not-like" />
                  ) : (
                    <img src="/icons/star/gold.svg" alt="like" />
                  )}
                </>
              )}
            </button>
          </div>
          <div className="text-base">
            {visitLinkActive ? (
              <>
                {club?.websiteLink && (
                  <Link
                    href={club?.websiteLink ? (club?.websiteLink.includes('http') ? club?.websiteLink : `http://${club?.websiteLink}`) : ""}
                    rel="noopener noreffer"
                  >
                    <button className="bg-gradient-to-r from-theme_primary to-theme_secondary flex gap-2 justify-center items-center tracking-wider font-medium p-3 rounded-lg text-theme_text_normal shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="22px"
                        viewBox="0 -960 960 960"
                        width="22px"
                        fill="#ffffff"
                      >
                        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
                      </svg>
                      Visit
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <Link
                href={{
                  pathname: "/student/clubs/view",
                  query: {
                    id: club?.id ? club?.id : null,
                  },
                }}
              >
                <button className="bg-gradient-to-br from-theme_primary to-theme_secondary tracking-wider font-medium text-sm p-3 rounded-lg text-theme_text_normal shadow-lg">
                  Explore
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubCard;
