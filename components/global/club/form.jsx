import Cookies from "js-cookie";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authExpiry } from "@/functions/auth-expiry";
import Link from "next/link";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

{
  /* Club Event Creation Form */
}
const EventForm = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const fileUpload = useRef(null);
  const [event, setEvent] = useState({
    image: null,
    title: "",
    websiteLink: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    OD: false,
    refreshment: false,
    label1: "",
    label2: "",
    label3: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Cookies.get("clubAuth")) {
      if (authExpiry(Cookies.get("clubAuth"))) {
        Cookies.remove("clubAuth");
        router.push("/");
      } else {
        setSubmitting(true);
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

        const formdata = new FormData();
        formdata.append("title", event.title);
        formdata.append("websiteLink", event.websiteLink);
        formdata.append("eventDates", `${event.startDate} to ${event.endDate}`);
        formdata.append(
          "eventTiming",
          `${event.startTime} to ${event.endTime}`
        );
        formdata.append("odsProvided", event.OD);
        formdata.append("refreshmentsProvided", event.refreshment);
        formdata.append("labels[]", event.label1);
        formdata.append("labels[]", event.label2);
        formdata.append("labels[]", event.label3);
        formdata.append("BannerImg", event.image);

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formdata,
          redirect: "follow",
        };

        fetch(
          "https://campusapi-puce.vercel.app/api/users/create-event",
          requestOptions
        )
          .then((response) => response.text())
          .then((result) => {
            console.log(result);
            setSubmitting(false);
            router.push("/mobile/club/admin/dashboard");
          })
          .catch((error) => {
            console.error(error);
            setSubmitting(false);
          });
      }
    } else {
      router.push("/");
    }
  };

  const onFormChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === "OD" || name === "refreshment") {
      setEvent((prevEvent) => ({ ...prevEvent, [name]: !prevEvent[name] }));
    } else if (type === "file") {
      setEvent((prevEvent) => ({ ...prevEvent, image: files[0] }));
    } else {
      setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    }
  };

  return (
    <>
      <div className="px-3 py-5">
        <div className="text-theme_text_primary flex justify-start gap-2 content-center text-xl py-4">
          Create Event
        </div>
        <div>
          <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`${defaultStyle} min-h-40`}
              onClick={() => fileUpload.current.click()}
            >
              <div className="flex flex-col justify-center items-center h-full">
                <input
                  type="file"
                  className="hidden"
                  name="image"
                  ref={fileUpload}
                  onChange={onFormChange}
                  accept="image/*"
                />
                {event.image == null && (
                  <>
                    <img src="/icons/camera/secondary.svg" className="w-7" />
                    <span className="text-theme_text_primary/80 text-sm py-2">
                      Upload Banner (2:1 Ratio preferred)
                    </span>
                  </>
                )}
                {event.image && (
                  <img
                    src={URL.createObjectURL(event.image)}
                    alt="Event Banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </button>
            <input
              type="text"
              placeholder="Event Title"
              className={`${defaultStyle}`}
              name="title"
              onChange={onFormChange}
              required
            />
            <input
              type="url"
              placeholder="Event Website Link (optional but preferred)"
              className={`${defaultStyle}`}
              name="websiteLink"
              onChange={onFormChange}
            />
            <div className="grid grid-cols-7 gap-1">
              <div
                className={`col-span-7 flex justify-between ${defaultStyle}`}
              >
                <span className="text-theme_text_primary">Event Dates</span>
                <span>
                  <img src="/icons/calender/primary.svg" className="w-5" />
                </span>
              </div>
              <input
                type="date"
                placeholder="Start Date"
                className={`col-span-3 ${defaultStyle}`}
                name="startDate"
                onChange={onFormChange}
                required
              />
              <span className="my-auto text-center text-lg font-medium col-span-1 text-theme_text_primary">
                to
              </span>
              <input
                type="date"
                placeholder="End Date"
                className={`col-span-3 ${defaultStyle}`}
                name="endDate"
                onChange={onFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-7 gap-1">
              <div
                className={`col-span-7 flex justify-between ${defaultStyle}`}
              >
                <span className="text-theme_text_primary">Event Timing</span>
                <span>
                  <img src="/icons/clock/primary.svg" className="w-5" />
                </span>
              </div>
              <input
                type="time"
                placeholder="Start Time"
                className={`col-span-3 ${defaultStyle}`}
                name="startTime"
                onChange={onFormChange}
                required
              />
              <span className="my-auto text-center text-lg font-medium col-span-1 text-theme_text_primary">
                to
              </span>
              <input
                type="time"
                placeholder="End Time"
                className={`col-span-3 ${defaultStyle}`}
                name="endTime"
                onChange={onFormChange}
                required
              />
            </div>
            <div className={`flex justify-between ${defaultStyle}`}>
              <span className="text-theme_text_primary">ODs are Provided</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="OD"
                  type="checkbox"
                  className="peer sr-only"
                  name="OD"
                  onChange={onFormChange}
                />
                <div className="peer h-6 w-11 rounded-full bg-theme_text_primary/10 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-theme_primary peer-checked:to-theme_secondary peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
              </label>
            </div>
            <div className={`flex justify-between ${defaultStyle}`}>
              <span className="text-theme_text_primary">
                Refreshments Provided
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="refreshment"
                  type="checkbox"
                  className="peer sr-only"
                  name="refreshment"
                  onChange={onFormChange}
                />
                <div className="peer h-6 w-11 rounded-full bg-theme_text_primary/10 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-theme_primary peer-checked:to-theme_secondary peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 px-1">
              <div className="text-theme_text_primary flex justify-start gap-2 content-center">
                Labels
                <button type="button">
                  <img src="/icons/info/primary.svg" className="w-4 mt-1" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Label 1"
                className={`${defaultStyle}`}
                name="label1"
                onChange={onFormChange}
                required
              />
              <input
                type="text"
                placeholder="Label 2"
                className={`${defaultStyle}`}
                name="label2"
                onChange={onFormChange}
                required
              />
              <input
                type="text"
                placeholder="Label 3"
                className={`${defaultStyle}`}
                name="label3"
                onChange={onFormChange}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-semibold tracking-wide"
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
                "Create Event"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

{
  /* Club Profile Form */
}
const ClubSignUpForm = () => {
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
    password: "",
    confirmPassword: "",
    isRecruiting: false,
    label1: "",
    label2: "",
    label3: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formdata = new FormData();
    formdata.append("name", club.name);
    formdata.append("description", club.description);
    formdata.append("email", club.email);
    formdata.append("password", club.password);
    formdata.append("passwordConfirm", club.confirmPassword);
    formdata.append("websiteLink", club.websiteLink);
    formdata.append("isRecruiting", club.isRecruiting);
    formdata.append("labels[]", club.label1);
    formdata.append("labels[]", club.label2);
    formdata.append("labels[]", club.label3);
    formdata.append("logo", club.logo);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch(
      "https://campusapi-puce.vercel.app/api/auth/club-register",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          console.log(result);
          setVerification(true);
          setSubmitting(false);
        } else {
          console.log(result);
          setSubmitting(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
      });
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
      <div className="px-3 py-5">
        <div className="text-theme_text_primary flex justify-center items-center gap-2 content-center text-xl py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="12px"
            viewBox="0 -960 960 960"
            width="12px"
            fill="#91C3E7"
          >
            <path d="M480-200q-117 0-198.5-81.5T200-480q0-117 81.5-198.5T480-760q117 0 198.5 81.5T760-480q0 117-81.5 198.5T480-200Z" />
          </svg>
          Club Sign Up
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="12px"
            viewBox="0 -960 960 960"
            width="12px"
            fill="#91C3E7"
          >
            <path d="M480-200q-117 0-198.5-81.5T200-480q0-117 81.5-198.5T480-760q117 0 198.5 81.5T760-480q0 117-81.5 198.5T480-200Z" />
          </svg>
        </div>
        <div className={verification ? "hidden" : ""}>
          <form className="grid grid-cols-1 gap-4">
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
                {club.logo == null && (
                  <>
                    <img src="/icons/camera/secondary.svg" className="w-7" />
                    <span className="text-theme_text_primary/80 text-sm py-2">
                      Upload Banner (1:1 Ratio preffered)
                    </span>
                  </>
                )}
                {club.logo && (
                  <img
                    src={URL.createObjectURL(club.logo)}
                    alt="Club Logo"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </button>
            <input
              type="text"
              placeholder="Club Name"
              className={`${defaultStyle}`}
              name="name"
              onChange={onFormChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className={`${defaultStyle}`}
              name="email"
              onChange={onFormChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className={`${defaultStyle}`}
              name="password"
              onChange={onFormChange}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className={`${defaultStyle}`}
              name="confirmPassword"
              onChange={onFormChange}
              required
            />
            {club.password != club.confirmPassword && (
              <span className="text-theme_red text-sm font-sans">
                The password and password conformation mismatch.
              </span>
            )}
            <div className={`${defaultStyle}`}>
              <textarea
                type="text"
                placeholder="Description"
                className={`bg-transparent w-full h-32 caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm`}
                name="description"
                maxLength={160}
                onChange={onFormChange}
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
                />
                <div className="peer h-6 w-11 rounded-full bg-theme_text_primary/10 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-theme_primary peer-checked:to-theme_secondary peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 gap-2 px-1">
              <div className="text-theme_text_primary flex justify-start gap-2 content-center">
                Labels
                <button>
                  {" "}
                  <img
                    src="/icons/info/primary.svg"
                    className="w-4 mt-1"
                  />{" "}
                </button>{" "}
              </div>
              <input
                type="text"
                placeholder="Label 1"
                className={`${defaultStyle}`}
                name="label1"
                onChange={onFormChange}
                required
              />
              <input
                type="text"
                placeholder="Label 2"
                className={`${defaultStyle}`}
                name="label2"
                onChange={onFormChange}
                required
              />
              <input
                type="text"
                placeholder="Label 3"
                className={`${defaultStyle}`}
                name="label3"
                onChange={onFormChange}
                required
              />
            </div>
            <span className="flex items-start h-full text-xs py-2 gap-2 text-theme_primary">
              <img src="/icons/info/primary.svg" className="w-4" />
              By signing up you agree to the Campus Web's Terms and Conditions
              and Privacy Policy.
            </span>
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
                "Join the Campus Web"
              )}
            </button>
          </form>
        </div>
        <div className={verification ? "" : "hidden"}>
          <div className={`${defaultStyle} mt-3 text-theme_text_primary`}>
            <div className="flex flex-col gap-4 h-full px-4 text-center my-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#91C3E7"
              >
                <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280 320-200v-80L480-520 160-720v80l320 200Z" />
              </svg>
              <div>
                Verification link has been sent to your email{" "}
                <span className="text-theme_primary underline">
                  {club.email}
                </span>
                . Open your inbox and click on the link to verify your account.
              </div>
            </div>
          </div>
        </div>
        <div className="text-theme_text_primary flex justify-center items-center gap-2 content-center text-lg py-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#91C3E7"
          >
            <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z" />
          </svg>
          <Link href="/" className="font-mono">
            Back to Sign In
          </Link>
        </div>
      </div>
    </>
  );
};

export { EventForm, ClubSignUpForm };
