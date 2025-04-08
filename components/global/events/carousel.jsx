import { useState, useEffect } from "react";
import SectionTitle from "@/components/global/section-title";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper";
import { useRouter } from "next/navigation";
import { baseURL } from "@/constants/baseURL";

const EventCarousel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const router = useRouter();

  const [sponsoredSelectedEvent, setSponsoredSelectedEvent] = useState(null);
  const [sponsoredIsModalOpen, setSponsoredIsModalOpen] = useState(false);

  const handleSponsoredEventClick = (event) => {
    setSponsoredSelectedEvent(event);
    setSponsoredIsModalOpen(true);
  };

  const closeSponsoredModal = () => {
    setSponsoredIsModalOpen(false);
  };

  const extractStartDate = (dateRange) => {
    return dateRange.split(" to ")[0];
  };
  
  const extractEndDate = (dateRange) => {
    return dateRange.split(" to ")[1];
  };

  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      cache: "no-cache",
    };
    fetch(`${baseURL}/api/users/allevent`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setEvents(result.data);
        console.log(result.data);
        setLoading(false);
        if (!localStorage.getItem("codenexdayzero")) {
          const sponsoredEvent = result?.data?.events.find(
            (event) =>
              event.club_name.includes("CODENEX") &&
              event.title.includes("Dayzero") &&
              new Date(extractEndDate(event.dates)) >= new Date()
          );
          if (sponsoredEvent) {
            setSponsoredSelectedEvent(sponsoredEvent);
            setSponsoredIsModalOpen(true);
          }
          localStorage.setItem("codenexdayzero", true);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const sortEventsByDate = (events) => {
    const currentDate = new Date();

    return events?.sort((a, b) => {
      const dateA = new Date(extractStartDate(a?.dates));
      const dateB = new Date(extractStartDate(b?.dates));

      // Calculate absolute difference from current date
      const diffA = Math.abs(currentDate - dateA);
      const diffB = Math.abs(currentDate - dateB);

      return diffA - diffB;
    });
  };

  const sortedEvents = sortEventsByDate(events?.events);

  

  return (
    <>
      <main>
        {sortedEvents && sortedEvents.length > 0 && (
          <>
            {sortedEvents &&
              sortedEvents
                .filter((event) => event.club_name.includes("CODENEX"))
                .filter((event) => event.title.includes("Dayzero"))
                .filter(
                  (event) => new Date(extractEndDate(event.dates)) >= new Date()
                )
                .map((event, index) => (
                  <SwiperSlide key={index}>
                    <div className="mt-3 rounded-lg">
                      <img
                        src={event.banner_url}
                        alt={`slide-${index}`}
                        className="rounded-lg h-[125px] w-full sm:h-[200px]"
                        onClick={() => handleSponsoredEventClick(event)}
                      />
                      <div className="flex justify-center items-center gap-1 rounded-full text-xs bottom-2 right-2 bg-gradient-to-r from-theme_primary/75 to-theme_secondary/75 text-white px-3 py-[2px] w-fit absolute">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="16px"
                          fill="#ffffff"
                        >
                          <path d="M852-212 732-332l56-56 120 120-56 56ZM708-692l-56-56 120-120 56 56-120 120Zm-456 0L132-812l56-56 120 120-56 56ZM108-212l-56-56 120-120 56 56-120 120Zm125 92 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z" />
                        </svg>
                        <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                          Sponsored
                        </span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
          </>
        )}
        <SectionTitle
          title="Events"
          icon="/icons/event/white.svg"
          textColor="theme_text_normal"
        />
        <div className="flex flex-wrap justify-center -mt-3 px-1">
          {loading ? (
            <div className="flex justify-center p-5">
              <svg
                className="animate-spin mx-auto h-7 w-7 text-theme_primary"
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
            </div>
          ) : (
            <>
              {events?.events ? (
                <Swiper
                  spaceBetween={30}
                  pagination={{ clickable: true, dynamicBullets: true }}
                  autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                  }}
                  modules={[Pagination, Autoplay]}
                  loop={true}
                  className="mySwiper bg-black rounded-lg pb-4 relative"
                >
                  {sortedEvents &&
                    sortedEvents
                      .filter(
                        (event) => !event.club_name.includes("TCW-20240916")
                      )
                      .filter(
                        (event) =>
                          new Date(extractEndDate(event.dates)) >= new Date() ||
                          event.club_name == "The Campus Web"
                      )
                      .map((event, index) => (
                        <SwiperSlide key={index}>
                          <div
                            style={{
                              backgroundImage: `url(${event.banner_url})`,
                            }}
                            className="bg-cover"
                          >
                            <img
                              src={event.banner_url}
                              alt={`slide-${index}`}
                              className="rounded-t-lg w-[370px] h-[175px] sm:w-full sm:h-[225px] object-contain backdrop-blur"
                              onClick={() => handleEventClick(event)}
                            />
                            <img
                              src={event.logo}
                              alt="Club Logo"
                              className="w-10 h-10 rounded-md object-cover absolute bottom-2 right-2"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                </Swiper>
              ) : (
                <div className="theme_box_bg py-6 w-full">
                  <span className="text-theme_text_normal font-medium tracking-wide flex justify-center">
                    No Events to Showcase
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className=" backdrop-blur-xl bg-theme_primary/10 p-5 rounded-lg shadow-lg w-11/12 md:w-1/2">
            <button
              className="absolute top-3 right-3 text-white text-xl font-bold"
              onClick={closeModal}
            >
              &times;
            </button>
            <img
              src={selectedEvent.banner_url}
              alt="Event Banner"
              className="w-full h-64 object-contain rounded-lg"
            />
            <div className="mt-5 flex flex-col justify-center items-center gap-5">
              <button
                className="bg-gradient-to-br rounded-xl from-theme_primary to-theme_secondary  text-white px-2 py-2 w-1/2 hover:bg-blue-600"
                onClick={() =>
                  window.open(selectedEvent.website_link, "_blank")
                }
              >
                Register
              </button>
              <button
                className="theme_box_bg text-theme_primary px-2 py-2 w-1/2 rounded whitespace-nowrap"
                onClick={() => {
                  closeModal();
                  router.push("student/events");
                }}
              >
                More Events &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Sponsor Modal */}
      {sponsoredIsModalOpen && sponsoredSelectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className=" backdrop-blur-xl bg-theme_primary/10 p-5 rounded-lg shadow-lg w-11/12 md:w-1/2">
            <button
              className="absolute top-3 right-3 text-white text-xl font-bold"
              onClick={closeSponsoredModal}
            >
              &times;
            </button>
            <img
              src={`assets/event/${sponsoredSelectedEvent.title
                ?.toLowerCase()
                .trim()}_${sponsoredSelectedEvent.club_name
                ?.toLowerCase()
                .trim()}.jpg`}
              alt="Event Banner"
              className="w-auto h-[70%] mt-10 rounded-md max-h-[400px] mx-auto"
            />
            <div className="mt-5 flex flex-col justify-center items-center gap-5">
              <button
                className="bg-gradient-to-br rounded-xl from-theme_primary to-theme_secondary  text-white px-2 py-2 w-1/2 hover:bg-blue-600"
                onClick={() =>
                  window.open(sponsoredSelectedEvent.website_link, "_blank")
                }
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCarousel;
