import { useState, useEffect } from "react";
import SectionTitle from "@/components/global/section-title";
import EventCard from "@/components/global/events/event-card";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper";

const EventCarousel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    fetch(
      "https://campusapi-puce.vercel.app/api/users/allevent",
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
                  {events?.events &&
                    events.events
                      .slice(0)
                      .reverse()
                      .map((event, index) => (
                        <SwiperSlide key={index}>
                          <div>
                            <img
                              src={event.banner_url}
                              alt={`slide-${index}`}
                              className="rounded-t-lg w-[370px] h-[175px]"
                            />
                            {/* <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div> */}
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
    </>
  );
};

export default EventCarousel;
