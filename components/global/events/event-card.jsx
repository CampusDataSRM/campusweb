import Link from "next/link";
import Cookies from "js-cookie";
import { useState } from "react";
import { deleteEvent } from "@/functions/api/club";
import { useRouter } from "next/navigation";

const EventCard = ({
  event,
  club,
  eventID,
  checkLiked,
  disabledPopularity,
  editEvent,
  flaggedHidden,
}) => {
  const [eventPopularity, setEventPopularity] = useState(
    event?.popularity ? event?.popularity : 0
  );
  const router = useRouter();

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
    myHeaders.append("eventid", eventID);

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/users/eventaction/",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        setUserClicked(false);
        if (currentStatus) {
          setEventPopularity(eventPopularity - 1);
        } else {
          setEventPopularity(eventPopularity + 1);
        }
        setCurrentStatus(!currentStatus);
      })
      .catch((error) => console.error(error));
  };

  const actionDeleteEvent = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      const confirmDelete = deleteEvent({
        eventID,
        authToken: Cookies.get("clubAuth"),
      });
      confirmDelete.then((data) => {
        if (data?.status === "success") {
          alert(data?.message);
          router.push("/club/admin/dashboard");
        } else {
          alert(data?.message);
        }
      });
    } else {
      return;
    }
  };

  return (
    <>
      <div className={flaggedHidden ? (club?.name.includes("TCW-20240916") ? 'hidden' : "w-full theme_box_bg rounded-xl" ) : "w-full theme_box_bg rounded-xl"}>
        <div>
          <img
            src={event?.banner_url}
            alt={event?.title}
            className="rounded-t-xl w-full object-contain max-h-[250px]"
          />
        </div>
        <div className="flex justify-between px-3 mt-5 tracking-wider">
          <div className="grid grid-cols-1 text-theme_text_normal my-auto">
            <div>{event?.title}</div>
            <div className="text-theme_text_normal_60">
              by {String(club?.name).toUpperCase()}
            </div>
          </div>
          <div className="">
            <img
              src={club?.logo}
              alt={club?.name}
              className="rounded-lg w-12 h-12"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 px-2 mt-4">
          {event?.labels &&
            event?.labels.map((value, index) => (
              <div
                name={value}
                key={index}
                className={value.length > 0 ? "theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full" : "hidden"}
              >
                {value}
              </div>
            ))}
          {event?.dates && (
            <div className="theme_box_bg text-theme_text_primary text-sm px-3 py-1 rounded-full">
              {event?.dates}
            </div>
          )}
        </div>
        <div
          className={`flex justify-between items-center px-2 py-3 ${
            event?.website_link ? "mt-1" : "mt-3 mb-1"
          }`}
        >
          <div className="text-base text-theme_text_primary flex items-center">
            <span>Popularity: {eventPopularity}</span>
            <span className="italic">x</span>
            <button
              className="pl-1"
              onClick={actionLikeUnlike}
              disabled={disabledPopularity ? true : userClicked}
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
                  {disabledPopularity ? (
                    <>
                      <img src="/icons/star/gold-solid.svg" alt="Not-like" />
                    </>
                  ) : (
                    <>
                      {currentStatus ? (
                        <img src="/icons/star/gold-solid.svg" alt="Not-like" />
                      ) : (
                        <img src="/icons/star/gold.svg" alt="like" />
                      )}
                    </>
                  )}
                </>
              )}
            </button>
          </div>
          {editEvent ? (
            <>
              <div className="text-base">
                <button
                  className="bg-theme_red/85 px-2 py-3 rounded-lg text-theme_text_normal font-medium tracking-wide shadow-lg"
                  onClick={actionDeleteEvent}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#e8eaed"
                  >
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              {event?.website_link && (
                <div className="text-base">
                  <Link
                    href={
                      event?.website_link
                        ? event?.website_link.includes("http")
                          ? event?.website_link
                          : `http://${event?.website_link}`
                        : ""
                    }
                    target="_blank"
                    rel="noopener noreffer"
                  >
                    <button className="bg-gradient-to-br from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-medium tracking-wide shadow-lg">
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EventCard;
