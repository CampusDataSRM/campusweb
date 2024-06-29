import EventCard from "@/components/global/events/event-card";
import { eventData } from "@/components/global/events/data";
const Event = () => {
    return(
        <>
        <div className="text-2xl text-theme_text_primary px-6 py-3">Events</div>
        <div className="flex flex-wrap justify-center gap-4 px-3 py-2">
            {eventData.map((event, index) => (
                <EventCard key={index} {...event} />
            ))}
        </div>
        </>
    );
};

export default Event;