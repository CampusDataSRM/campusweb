import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { baseURL } from "@/constants/baseURL";

const studentPageLink = [
  { name: "Home", link: "/student", icon: "/icons/home/" },
  {
    name: "Atten",
    link: "/student/attendance",
    icon: "/icons/percent/",
  },
  {
    name: "TimeT",
    link: "/student/timetable",
    icon: "/icons/clock/",
  },
  {
    name: "Marks",
    link: "/student/marks",
    icon: "/icons/bar-chart/",
  },
  {
    name: "Calen",
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
    name: "WIM",
    link: "/student/whatsinmess",
    icon: "/icons/whatsinmess/",
  },
  
  {
    name: "CGPA",
    link: "/student/cgpacalc",
    icon: "/icons/CGPA/",
},
  { name: "About us", link: "/about", icon: "/icons/us/" },
  {
    name: "WhatsApp",
    link: "https://chat.whatsapp.com/BeywTQOA1hlD1krovsr8sm",
    icon: "/icons/whatsapp_nav/",
  },
  { name: "Logout", link: "/", icon: "/icons/logout/" },
];

const FloatingNavbar = () => {
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();
  const currentRoute = usePathname();

  const handleMoreClick = () => setShowMore(!showMore);

  const sessionLogout = (e) => {
    console.log("logout");

    e?.preventDefault();
    const myHeaders = new Headers();
    myHeaders.append("X-CSRF-Token", Cookies.get("X-CSRF-Token"));

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${baseURL}/api/auth/logoutuser/`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        localStorage.clear();
        Cookies.remove("X-CSRF-Token");
        router.push("/");
        console.log(result);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="fixed bottom-4 z-50 w-full px-2 max-w-[630px]">
      <nav className="w-full md:mx-0  rounded-xl bg-black/50 backdrop-blur-lg shadow-lg py-1">
        <ul className="flex justify-around relative">
          {studentPageLink.slice(0, 5).map((item) => (
            <li
              key={item.name}
              className="flex flex-col items-center px-[5px] py-2"
            >
              <button
                onClick={
                  item.name === "Logout"
                    ? sessionLogout
                    : item.name === "WhatsApp"
                    ? () => router.replace(item.link)
                    : () => router.push(item.link)
                }
                className={`flex flex-col items-center `}
              >
                <img
                  src={
                    item.icon +
                    (currentRoute === item.link
                      ? "secondary.svg"
                      : "primary.svg")
                  }
                  alt={item.name}
                  className={`w-6 h-6 mb-1 ${
                    currentRoute === item.link
                      ? "scale-125 opacity-100"
                      : "opacity-80"
                  }`}
                />
                <span
                  className={` ${
                    currentRoute === item.link
                      ? "font-extrabold text-sm text-theme_primary"
                      : "text-gray-200/80 text-xs font-semibold"
                  }`}
                >
                  {item.name.slice(0, 7)}
                </span>
              </button>
            </li>
          ))}
          <li className="flex flex-col items-center p-2">
            <button
              onClick={handleMoreClick}
              className="flex flex-col items-center"
            >
              <img
                src={`/icons/more/primary.svg`}
                alt="More"
                className="w-6 h-6 mb-1"
              />
              <span className="text-xs text-gray-200/80">More</span>
            </button>
            {showMore && (
              <>
                {/* original menu */}
                <ul className="absolute bottom-[4.4rem] right-0 bg-[#070a1c]/95 rounded-xl shadow-lg p-2 space-y-2">
                  {studentPageLink
                    .slice(5)
                    .reverse()
                    .map((item) => (
                      <li
                        key={item.name}
                        className="flex flex-col items-center px-[5px] py-2"
                      >
                        <button
                          // href={item.link}
                          onClick={
                            item.name === "Logout"
                              ? sessionLogout
                              : item.name === "WhatsApp"
                              ? () => router.replace(item.link)
                              : () => router.push(item.link)
                          }
                          className={`flex flex-col items-center `}
                        >
                          <img
                            src={
                              item.icon +
                              (currentRoute === item.link
                                ? "secondary.svg"
                                : "primary.svg")
                            }
                            alt={item.name}
                            className={`w-6 h-6 mb-1 ${
                              currentRoute === item.link ? "scale-125" : ""
                            }`}
                          />
                          <span
                            className={`${
                              currentRoute === item.link
                                ? "font-extrabold text-sm text-theme_primary"
                                : "text-gray-200/80 text-xs font-semibold"
                            }`}
                          >
                            {item.name.slice(0, 6)}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default FloatingNavbar;
