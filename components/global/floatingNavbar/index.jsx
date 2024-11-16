import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const studentPageLink = [
  { name: "Dashboard", link: "/student", icon: "/icons/home/" },
  {
    name: "Attendance",
    link: "/student/attendance",
    icon: "/icons/percent/",
  },
  {
    name: "Timetable",
    link: "/student/timetable",
    icon: "/icons/clock/",
  },
  {
    name: "Marks",
    link: "/student/marks",
    icon: "/icons/bar-chart/",
  },
  {
    name: "Calendar",
    link: "/student/calendar",
    icon: "/icons/calender/",
  },
  { name: "Events", link: "/student/events", icon: "/icons/event/" },
  {
    name: "Clubs",
    link: "/student/clubs",
    icon: "/icons/user-group/",
  },
  {
    name: "WhatsInMess",
    link: "/student/whatsinmess",
    icon: "/icons/whatsinmess/",
  },
  { name: "About us", link: "/about", icon: "/icons/us/" },
  {
    name: "WhatsApp",
    link: "https://chat.whatsapp.com/CPzWkEnCXKEH897pgiNcMy",
    icon: "/icons/whatsapp_nav/",
  },
  { name: "Logout", link: "/", icon: "/icons/logout/" },
];

const FloatingNavbar = () => {
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const currentRoute = usePathname();

  const handleMoreClick = () => setShowMore(!showMore);

  useEffect(() => {
    console.log(currentRoute);
  }, []);

  return (
    <div className="relative">
          <nav className="fixed bottom-5 md:w-full  max-w-[615px] md:mx-0 mx-5 z-50 bg-black/50 backdrop-blur-lg rounded-xl shadow-lg py-1">
        <ul className="flex justify-around relative md:max-w-[615px] w-[90vw]">
          {studentPageLink.slice(0, 5).map((item) => (
            <li
              key={item.name}
              className="flex flex-col items-center px-[5px] py-2"
            >
              <a href={item.link} className={`flex flex-col items-center `}>
                <img
                  src={item.icon+(currentRoute === item.link ? "secondary.svg" : "primary.svg")}
                  alt={item.name}
                  className={`w-6 h-6 mb-1 ${
                    currentRoute === item.link ? "scale-125" : ""
                  }`}
                />
                <span
                  className={` ${
                    currentRoute === item.link
                      ? "font-bold text-sm text-theme_secondary"
                      : "text-gray-50 text-xs"
                  }`}
                >
                  {item.name.slice(0, 5)}
                </span>
              </a>
            </li>
          ))}
          <li className="relative flex flex-col items-center p-2">
            <button
              onClick={handleMoreClick}
              className="flex flex-col items-center"
            >
              <img
                src={`/icons/more/primary.svg`}
                alt="More"
                className="w-6 h-6 mb-1"
              />
              <span className="text-xs text-gray-50">More</span>
            </button>
            {showMore && (
              <ul className="absolute bottom-[4.4rem] -right-2 bg-black/70 backdrop-filter backdrop-blur-2xl rounded-xl shadow-lg p-2 space-y-2">
                {studentPageLink.slice(5).reverse().map((item) => (
                  <li
                    key={item.name}
                    className="flex flex-col items-center px-[5px] py-2"
                  >
                    <a
                      href={item.link}
                      className={`flex flex-col items-center `}
                    >
                      <img
                        src={item.icon+(currentRoute === item.link ? "secondary.svg" : "primary.svg")}
                        alt={item.name}
                        className={`w-6 h-6 mb-1 ${
                          currentRoute === item.link ? "scale-125" : ""
                        }`}
                      />
                      <span
                        className={`${
                          currentRoute === item.link
                            ? "font-bold text-sm text-theme_secondary"
                      : "text-gray-50 text-xs"
                        }`}
                      >
                        {item.name.slice(0, 6)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default FloatingNavbar;
