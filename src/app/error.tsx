"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
//import Cookies from "js-cookie";

const Error = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen w-full"></div>
    </>
  );
};

export default Error;
