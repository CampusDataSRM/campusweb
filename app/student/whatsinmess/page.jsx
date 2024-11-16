"use client";

import Navbar from "@/components/global/navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import Loader from "@/components/global/loader";
import SwipeUpDrawer from "../../../components/SwipeUpDrawer/page";
import PrevNextButton from "../../../components/PrevNextButton/page";
import { pageNames } from "@/components/global/navbar/page-link";
import FloatingNavbar from "@/components/global/floatingNavbar";

const WhatsinmessPage = () => {
  const [menu, setMenu] = useState();
  const [currentMenu, setCurrentMenu] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [drawer, setDrawer] = useState("");
  const [messName, setMessName] = useState(null);
  const [isEditingMenu, setIsEditingMenu] = useState(false);

  const fetchMenu = async () => {
    console.log("messName : ", messName);
    
    if (!messName) {
      if (localStorage.getItem("localMessName")) {
        setMessName(localStorage.getItem("localMessName"));
      } else {
        setMessName("Sannasi");
        localStorage.setItem("localMessName", "Sannasi");
      }
      return;
    }
    try {
      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbxqEiE1uo_-jim6lwZsIqSQFhogG9spXAyJXMrod71AMMmoHHortHJnUpkfbs3DQxCq/exec?messName=${messName}`
      );
      if (!response.ok) {
        throw new Error("Sheets Network response was not ok");
      }
      setIsLoading(false);
      const data = await response.json();
      setMenu(data.data[0]);
      localStorage.setItem("localMenu", JSON.stringify(data.data[0]));
    } catch (error) {
      console.log("ERROR :", menu, currentDay, currentTime);
      console.log("ERROR :", error);
    }
  };

  // setting the current day and time
  const [currentDay, setCurrentDay] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const getCurrentMealHelper = (hour, min) => {
    const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];

    if (hour < 9) {
      return meals[0];
    } else if (hour < 13) {
      return meals[1];
    } else if (hour == 13 && min < 30) {
      return meals[1];
    } else if (hour < 17) {
      return meals[2];
    } else if (hour == 17 && min < 30) {
      return meals[2];
    } else if (hour < 24) {
      return meals[3];
    }
  };

  const timeSetter = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    let now = new Date();
    let day = days[now.getDay()];
    setCurrentDay(day);

    //     // set current time
    let hour = now.getHours();
    let min = now.getMinutes();
    let meal = getCurrentMealHelper(hour, min);
    setCurrentTime(meal);
  };

  useEffect(() => {

    if (messName && messName != undefined) {
      if(messName != localStorage.getItem("localMessName")) {
        setIsLoading(true)
      }
      fetchMenu().then(() => {
        localStorage.setItem("localMessName", messName)
      });
    } else {
      console.log("messName is null or undefined");
    }
  }, [messName]);

  useEffect(() => {
    timeSetter();
  }, []);

  // Caching
  const checkLocalMenu = () => {
    let localMenu = localStorage.getItem("localMenu");

    localMenu ? setMenu(JSON.parse(localMenu)) : null;
    isLoading ? setIsLoading(false) : null;
  };

  useEffect(() => {
    checkLocalMenu();
    fetchMenu();
  }, []);

  useEffect(() => {
    if (menu) {
      setCurrentMenu(menu[currentDay][currentTime]);
    }
  }, [menu, currentDay, currentTime]);

  return (
    <div className="max-h-screen overflow-auto">
      <Navbar items={pageNames.filter(item => item !== "WhatsInMess")} />
      <FloatingNavbar />

      <div className="px-4">
        {/* Heading and settings button */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/whatsinmess_logo.svg"
              className="mx-2"
              width={28}
              height={28}
              alt="Whatsinmess"
            />
            <div className="text-[#91C3E7]">
              <h3 className="text-2xl">WhatsInMess</h3>
              <p className="text-sm">
                {currentDay.toLocaleUpperCase()} -{" "}
                {currentTime.toLocaleUpperCase()}
              </p>
            </div>
          </div>
          <Image
            src="/settings.svg"
            className="mx-2"
            width={28}
            height={28}
            alt="Whatsinmess"
            onClick={() => setDrawer("settings")}
          />
        </div>

        {/* Menu list */}
        <div className="my-4 min-h-screen text-[#91C3E7] flex flex-col gap-2">
          {!isLoading && currentMenu ? (
            currentMenu.split(",")?.map((item, index) => {
              return (
                <div
                  className="theme_box_bg flex items-center py-3"
                  key={index}
                >
                  <Image
                    src="/whatsinmess_bulletpoint.svg"
                    className="mx-4"
                    width={15}
                    height={15}
                    alt="Whatsinmess"
                  />
                  <p>{item}</p>
                </div>
              );
            })
          ) : (
            <div className="w-full h-screen flex items-start pt-80 justify-center">
              <Loader />
            </div>
          )}
        </div>
      </div>

      {/* previous next buttons */}
      <PrevNextButton
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
        currentMeal={currentTime}
        setCurrentMeal={setCurrentTime}
        isDrawer={drawer}
      />

      {/* Drawer */}
      <SwipeUpDrawer
        isDrawer={drawer}
        setDrawer={setDrawer}
        currentDay={currentDay}
        setCurrentDay={setCurrentDay}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        setIsEditingMenu={setIsEditingMenu}
        messName={messName}
        setMessName={setMessName}
      />
    </div>
  );
};

export default WhatsinmessPage;
