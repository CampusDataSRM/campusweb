"use client";

import Link from "next/link";
import Navbar from "@/components/global/navbar";
import SectionTitle from "@/components/global/section-title";
import { pageNames } from "@/components/global/navbar/page-link";
import TeamCard from "@/components/global/team/card";
import { teamData, contactData } from "@/components/global/team/data";
import FloatingNavbar from "@/components/global/floatingNavbar";
import NotFound from "../not-found";


const AboutTeam = () => {
  return (
    <>
      <div className="max-h-screen overflow-auto pb-24">
        <Navbar items={pageNames.filter((item) => item !== "About us")} />
        <FloatingNavbar />
        <main className="px-3 pb-3">
          <div className="flex justify-start items-center gap-3 text-xl pt-6 pb-3 font-medium">
            <img src="/icons/us/secondary.svg" alt="team" className="h-4" />
            <div className="text-theme_text_primary">About us</div>
          </div>
          <div className="theme_box_bg w-full py-6 px-4">
            <span className="text-theme_text_normal/80 tracking-wide flex justify-start">
            We are Team loopify, still figuring out who we are... 
            </span>
          </div>
          <div className="mt-3">
            <SectionTitle title="Our Team" icon="/icons/team/secondary.svg" />
            <div className="flex flex-col gap-3 -mt-2">
              {teamData.map((item, index) => (
                <TeamCard key={index} {...item} />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <SectionTitle title="Contact" icon="/icons/contact/secondary.svg" />
            <div className="theme_box_bg py-6 px-4 flex flex-col gap-5 justify-center items-center">
              <Link href={"/"}>
                <img
                  src="/assets/team/Campus Web.svg"
                  alt="Campus Web"
                  className="w-20"
                />
              </Link>
              {contactData.map((item, index) => (
                <div
                  className="flex flex-col gap-2 justify-center items-center"
                  key={index}
                >
                  <div className="text-theme_text_primary text-[22px] font-medium">
                    {item.title}
                  </div>
                  <div className="flex gap-5 ">
                    {item.links.map((link, index) => (
                      <Link href={link.link} key={index} disabled={!link.name.includes("instagram")} target="_blank" rel="noopener noreffer" >
                        <img
                          src={`/icons/${link.name}/primary.svg`}
                          alt={link.name}
                          className="w-8 cursor-pointer"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AboutTeam;
