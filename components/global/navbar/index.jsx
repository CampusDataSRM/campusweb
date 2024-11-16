import { useState } from "react";
import { useRouter } from "next/navigation";
import { studentPageLink } from "./page-link";
import SwipeUpDrawer from "@/components/SwipeUpDrawer/page";

const Navbar = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <div>
        <div className="flex justify-between px-4 pt-8">
          <div onClick={() => router.push("/student")}>
            <img src="/logo.svg" alt="logo" className="h-7" />
          </div>
          {/* {isOpen ? (
            <button onClick={() => setIsOpen(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#ffffff"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </button>
          ) : (
            <button onClick={() => setIsOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#ffffff"
              >
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </button>
          )} */}
        </div>
        <div className={`absolute bottom-0 h-auto overflow-hidden w-screen max-w-4xl ${isOpen ? "z-50" : "-z-50"}`}>
          <SwipeUpDrawer isDrawer={isOpen ? "nav" : null} studentPageLink={studentPageLink} items={items} setDrawer={setIsOpen} />
        </div>
        <br />
      </div>
    </>
  );
};

export default Navbar;
