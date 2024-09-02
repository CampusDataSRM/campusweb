import { useState, useEffect } from "react";
import SectionTitle from "@/components/global/section-title";

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

  // console.log(events.events);

  return (
    <>
      <div></div>
    </>
  );
};

export default EventCarousel;
