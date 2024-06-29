import EventCard from "@/components/global/events/event-card";
import { eventData } from "@/components/global/events/data";
const Event = () => {
    return(
        <>
        <div className="flex flex-wrap justify-center gap-4 px-2">
            {eventData.map((event, index) => (
                <EventCard key={index} {...event} />
            ))}
        </div>
        </>
    );
};

export default Event;