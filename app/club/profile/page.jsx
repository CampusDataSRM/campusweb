"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toTitleCase } from "@/functions/title-case-convert";
import Cookies from "js-cookie";
import Link from "next/link";
import { authExpiry } from "@/functions/auth-expiry";
import SectionTitle from "@/components/global/section-title";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

const ClubProfile = () => {
  const fileUpload = useRef(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState(false);
  const [club, setClub] = useState({
    logo: null,
    name: "",
    description: "",
    websiteLink: "",
    email: "",
    isRecruiting: false,
    label1: "",
    label2: "",
    label3: "",
  });
  const [clubLogoUrl, setClubLogoUrl] = useState("");
  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
        router.push("/");
      } else {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };

        fetch(
          "https://campusapi-puce.vercel.app/api/users/getprofile",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            {
              result &&
                result.data &&
                setClub({
                  ...club,
                  name: result.data.name,
                  description: result.data.description,
                  websiteLink: result.data.websiteLink,
                  email: result.data.email,
                  label1: result.data.labels[0] || "",
                  label2: result.data.labels[1] || "",
                  label3: result.data.labels[2] || "",
                });
            }
            setClubLogoUrl(result.data.logo);
          })
          .catch((error) => console.error(error));
      }
    } else {
      router.push("/");
    }
  }, []);

  const handleSubmit = (e) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

    const formdata = new FormData();
    formdata.append("name", "Aditya's Club");
    formdata.append("description", "This is my club");
    formdata.append("websiteLink", "some.xyz");
    formdata.append("isRecruiting", "false");
    formdata.append("labels[]", "My Label");
    formdata.append("labels[]", "My Label");
    formdata.append(
      "logo",
      fileInput.files[0],
      "/C:/Users/user/Downloads/File Server Architecture.jpg"
    );

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/users/updateprofile",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  };
  const [descriptionLength, setDescriptionLength] = useState(0);

  const onFormChange = (e) => {
    if (e.target.name == "isRecruiting") {
      setClub({ ...club, [e.target.name]: !club[e.target.name] });
    } else if (e.target.type == "file") {
      setClub({ ...club, [e.target.name]: e.target.files[0] });
    } else if (e.target.name == "description") {
      setDescriptionLength(e.target.value.length);
      setClub({ ...club, [e.target.name]: e.target.value });
    } else {
      setClub({ ...club, [e.target.name]: e.target.value });
    }
  };

  return (
    <>
      <div className="px-3 py-5 max-h-screen overflow-auto sm:hidden">
        <div className="py-5">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <SectionTitle
          title="Club Profile"
          icon={"/icons/user-group/secondary.svg"}
        />

        <form className="grid grid-cols-1 -mt-2 gap-4">
          <button
            className={`${defaultStyle} min-h-40`}
            onClick={() => fileUpload.current.click()}
          >
            <div className="flex flex-col justify-center items-center h-full">
              <input
                type="file"
                placeholder="Event Image"
                className={`hidden`}
                name="logo"
                ref={fileUpload}
                onChange={onFormChange}
                accept="image/*"
              />
              {club.logo == null ||
                (clubLogoUrl && (
                  <>
                    <img src="/icons/camera/secondary.svg" className="w-7" />
                    <span className="text-theme_text_primary/80 text-sm py-2">
                      Upload Banner (1:1 Ratio preffered)
                    </span>
                  </>
                ))}
              {club.logo ? (
                <img
                  src={URL.createObjectURL(club.logo)}
                  alt="Club Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={clubLogoUrl}
                  alt="Club Logo"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </button>
          <input
            type="email"
            placeholder="Club Email"
            className={`${defaultStyle}`}
            name="email"
            onChange={onFormChange}
            value={club.email}
            disabled
          />
          <input
            type="text"
            placeholder="Club Name"
            className={`${defaultStyle}`}
            name="name"
            onChange={onFormChange}
            value={club.name}
            required
          />
          <div className={`${defaultStyle}`}>
            <textarea
              type="text"
              placeholder="Description"
              className={`bg-transparent w-full h-32 caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm`}
              name="description"
              maxLength={160}
              onChange={onFormChange}
              value={club.description}
              required
            />
            <span className="text-theme_text_primary text-sm flex justify-end">
              {descriptionLength}/160
            </span>
          </div>
          <input
            type="url"
            placeholder="Club Website Link (optional)"
            className={`${defaultStyle}`}
            name="websiteLink"
            onChange={onFormChange}
            value={club.websiteLink}
          />
          <div className={`flex justify-between ${defaultStyle}`}>
            <span className="text-theme_text_primary">Is Recruiting</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                id="isRecruiting"
                type="checkbox"
                className="peer sr-only"
                name="isRecruiting"
                onChange={onFormChange}
                checked={club.isRecruiting}
              />
              <div className="peer h-6 w-11 rounded-full bg-theme_text_primary/10 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-theme_primary peer-checked:to-theme_secondary peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-2 px-1">
            <div className="text-theme_text_primary flex justify-start gap-2 content-center">
              Labels
              <button>
                {" "}
                <img src="/icons/info/primary.svg" className="w-4 mt-1" />{" "}
              </button>{" "}
            </div>
            <input
              type="text"
              placeholder="Label 1"
              className={`${defaultStyle}`}
              name="label1"
              onChange={onFormChange}
              value={club.label1}
              required
            />
            <input
              type="text"
              placeholder="Label 2"
              className={`${defaultStyle}`}
              name="label2"
              onChange={onFormChange}
              value={club.label2}
              required
            />
            <input
              type="text"
              placeholder="Label 3"
              className={`${defaultStyle}`}
              name="label3"
              onChange={onFormChange}
              value={club.label3}
              required
            />
          </div>
          <button
            type="button"
            className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-semibold tracking-wide"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <svg
                className="animate-spin mx-auto h-7 w-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Update Profile"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ClubProfile;
