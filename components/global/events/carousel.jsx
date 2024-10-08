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

  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
      cache: "no-cache", 
    };
    fetch(
      `${baseURL}/api/users/allevent`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setEvents(result.data);
        setLoading(false);
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

  const extractStartDate = (dateRange) => {
    return dateRange.split(" to ")[0];
  };

  const sortedEvents = events?.events?.sort((a, b) => {
    if (a.club_name === "The Campus Web") return -1;
    if (b.club_name === "The Campus Web") return 1;
    const dateA = new Date(extractStartDate(a.dates));
    const dateB = new Date(extractStartDate(b.dates));
    return dateB - dateA;
  });

  return (
    <>
      <main>
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
                      .slice(0)
                      .reverse()
                      .filter(
                        (event) => !event.club_name.includes("TCW-20240916")
                      )
                      .map((event, index) => (
                        <SwiperSlide key={index}>
                          <div style={{backgroundImage: `url(${event.banner_url})`}} className="bg-cover">
                            <img
                              src={event.banner_url}
                              alt={`slide-${index}`}
                              className="rounded-t-lg w-[370px] h-[175px] sm:w-full sm:h-[225px] object-contain backdrop-blur"
                              onClick={() => handleEventClick(event)}
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
    </>
  );
};

export default EventCarousel;
