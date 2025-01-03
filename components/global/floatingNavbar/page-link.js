const studentPageLink = [
    {
        name: "Dashboard",
        link: "/student",
        icon: "/icons/home/primary.svg",
    },
    {
        name: "Attendance",
        link: "/student/attendance",
        icon: "/icons/percent/primary.svg",
    },
    {
        name: "Timetable",
        link: "/student/timetable",
        icon: "/icons/clock/primary.svg",
    },
    {
        name: "Marks",
        link: "/student/marks",
        icon: "/icons/bar-chart/primary.svg",
    },
    {
        name: "Calendar",
        link: "/student/calendar",
        icon: "/icons/calender/primary.svg",
    },
    // {
    //     name: "Planner",
    //     link: "/student/planner",
    //     icon: "/icons/loader/primary.svg",
    // },
    {
        name: "Events",
        link: "/student/events",
        icon: "/icons/event/primary.svg",
    },
    {
        name: "Clubs",
        link: "/student/clubs",
        icon: "/icons/user-group/primary.svg",
    },
    {
        name: "WhatsInMess",
        link: "/student/whatsinmess",
        icon: "/whatsinmess_bulletpoint.svg",
    },
    {
        name: "CGPA Calculator",
        link: "/student/cgpacalc",
        icon: "/icons/CGPA/primary.svg",
    },
    {
        name: "About us",
        link: "/about",
        icon: "/icons/us/primary.svg",
    },
    {
        name: "WhatsApp",
        link: "https://chat.whatsapp.com/BeywTQOA1hlD1krovsr8sm",
        icon: "/icons/whatsapp_nav/no-fill.svg",
   },
    {
        name: "Logout",
        link: "/",
        icon: "/icons/logout/primary.svg",
   },
];

const pageNames = studentPageLink.map((entity) => entity.name);

export { studentPageLink, pageNames };