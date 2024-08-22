import { useState } from "react";
import { useRouter } from "next/navigation";

const Navbar = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <div>
        <div className="flex justify-between px-4 pt-8">
          <div>
            <img src="/logo.svg" alt="logo" className="h-7" />
          </div>
          {isOpen ? (
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
          )}
        </div>
        <div>
          {isOpen && (
            <div className="grid grid-cols-2 gap-[6px] mt-4 px-4">
              {items?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(item.link)}
                  className="flex justify-center py-4 bg-theme_primary/10 rounded-md gap-4 items-center"
                >
                  <img src={item.icon} alt={item.name} className="h-5 w-auto" />
                  <span className="text-white font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <br />
      </div>
    </>
  );
};

export default Navbar;
