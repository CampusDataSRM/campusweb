"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { authExpiry } from "@/functions/auth-expiry";
import { baseURL } from "@/constants/baseURL";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl disabled:text-theme_text_normal_60";

const UpdateClubProfile = () => {
  const fileUpload = useRef(null);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState(false);
  const [profileUpdate, setProfileUpdate] = useState(false);

  const [club, setClub] = useState({
    name: "",
    description: "",
    websiteLink: "",
    email: "",
    isRecruiting: false,
    label1: "",
    label2: "",
    label3: "",
    logo: null, // Added 'logo' to club state
  });

  const [newLogo, setNewLogo] = useState(null); // Handle new uploaded logo
  const [clubLogoUrl, setClubLogoUrl] = useState(""); // For displaying existing logo

  // Fetch club profile data
  useEffect(() => {
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
        router.push("/client/login/club");
      } else {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
          cache: "no-store",
        };

        fetch(
          `${baseURL}/api/users/getprofile`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            if (result && result.data) {
              setClub({
                ...club,
                name: result.data.name,
                description: result.data.description,
                websiteLink: result.data.websiteLink,
                isRecruiting: result.data.isRecruiting,
                email: result.data.email,
                label1: result.data.labels[0] || "",
                label2: result.data.labels[1] || "",
                label3: result.data.labels[2] || "",
                logo: result.data.logo, // Set existing logo
              });
              setClubLogoUrl(result.data.logo);
            }
          })
          .catch((error) => console.error(error));
      }
    } else {
      router.push("/client/login/club");
    }
  }, [profileUpdate]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

    const formData = new FormData();
    formData.append("name", club.name);
    formData.append("description", club.description);
    formData.append("websiteLink", club.websiteLink);
    formData.append("isRecruiting", club.isRecruiting);
    formData.append("labels[]", club.label1);
    formData.append("labels[]", club.label2);
    formData.append("labels[]", club.label3);

    if (newLogo) {
      formData.append("logo", newLogo);
    }

    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: formData,
      redirect: "follow",
    };

    fetch(
      `${baseURL}/api/users/updateprofile`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        alert(JSON.stringify(result));
        setSubmitting(false);
        setProfileUpdate(!profileUpdate);
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
      });
  };

  // Handle changes in form input
  const onFormChange = (e) => {
    if (e.target.name === "isRecruiting") {
      setClub({ ...club, [e.target.name]: !club[e.target.name] });
    } else if (e.target.type === "file") {
      setNewLogo(e.target.files[0]); // Handle new logo
    } else {
      setClub({ ...club, [e.target.name]: e.target.value });
    }
  };

  return (
    <>
      <div className="">
        <form className="grid grid-cols-1 -mt-2 gap-4" onSubmit={handleSubmit}>
          <button
            type="button" // Changed to 'button' to prevent form submission
            className={`${defaultStyle} min-h-40`}
            onClick={() => fileUpload.current.click()}
          >
            <div className="flex flex-col justify-center items-center h-full">
              <input
                type="file"
                className="hidden"
                name="logo"
                ref={fileUpload}
                onChange={onFormChange}
                accept="image/png, image/jpeg, image/jpg"
              />
              {/* Image display logic based on logo state */}
              {club.logo == null ||
                (clubLogoUrl && (
                  <>
                    <img src="/icons/camera/secondary.svg" className="w-7" />
                    <span className="text-theme_text_primary/80 text-sm py-2">
                      Upload Logo (1:1 Ratio preferred)
                    </span>
                  </>
                ))}
              {club.logo ? (
                <img
                  src={newLogo ? URL.createObjectURL(newLogo) : clubLogoUrl}
                  alt="Club Logo"
                  className="w-32 h-32 rounded-md"
                />
              ) : (
                <img
                  src={clubLogoUrl}
                  alt="Club Logo"
                  className="w-32 h-32 rounded-md"
                />
              )}
            </div>
          </button>

          {/* Other form fields */}
          <input
            type="email"
            placeholder="Club Email"
            className={`${defaultStyle}`}
            name="email"
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
          <textarea
            placeholder="Description"
            className={`${defaultStyle} h-32`}
            name="description"
            maxLength={160}
            onChange={onFormChange}
            value={club.description}
            required
          />
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
          {/* Label inputs */}
          <div className="text-theme_text_primary flex items-center mt-2 justify-start gap-2 content-center">
            Labels
            <button>
              {" "}
              <img src="/icons/info/primary.svg" className="w-4" />{" "}
            </button>{" "}
          </div>
          <input
            type="text"
            placeholder="Label 1"
            className={`${defaultStyle}`}
            name="label1"
            onChange={onFormChange}
            value={club.label1}
          />
          <input
            type="text"
            placeholder="Label 2"
            className={`${defaultStyle}`}
            name="label2"
            onChange={onFormChange}
            value={club.label2}
          />
          <input
            type="text"
            placeholder="Label 3"
            className={`${defaultStyle}`}
            name="label3"
            onChange={onFormChange}
            value={club.label3}
          />

          {/* Submit button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-semibold tracking-wide"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </>
  );
};

export default UpdateClubProfile;
