import { useState, useRef } from "react";
import Cookies from "js-cookie";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

{
  /* Club Event Creation Form */
}
const EventForm = () => {
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
    console.log(event);
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${Cookies.get("clubAuth")}`);

    const formdata = new FormData();
    formdata.append("title", event.title);
    formdata.append("websiteLink", event.websiteLink);
    formdata.append("eventDates", `${event.startDate} to ${event.endDate}`);
    formdata.append("eventTiming", `${event.startTime} to ${event.endTime}`);
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
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
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
              <div className={`col-span-7 flex justify-between ${defaultStyle}`}>
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
              <div className={`col-span-7 flex justify-between ${defaultStyle}`}>
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
            <div className="py-5 flex justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-theme_primary to-theme_secondary px-6 py-2 text-theme_text_secondary rounded-lg"
              >
                Create Event
              </button>
            </div>
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
  const [club, setClub] = useState({
    logo: null,
    name: "",
    description: "",
    websiteLink: "",
    isRecruiting: false,
    label1: "",
    label2: "",
    label3: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(club);
  };
  const [descriptionLength, setDescriptionLength] = useState(0);

  const onFormChange = (e) => {
    if (e.target.name == "isRecruiting") {
      setClub({ ...club, [e.target.name]: !club[e.target.name] });
    } else if (e.target.name == "logo") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setClub({ ...club, logo: reader.result });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setClub({ ...club, [e.target.name]: e.target.value });
      setDescriptionLength(e.target.value.length);
    }
  };
  return (
    <>
      <div className="px-3 py-5">
        <div className="text-theme_text_primary flex justify-start gap-2 content-center text-xl py-4">
          Club Sign Up
        </div>
        <div>
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
                <img src="/icons/camera/secondary.svg" className="w-7" />
                <span className="text-theme_text_primary/80 text-sm py-2">
                  Upload Banner (1:1 Ratio preffered)
                </span>
                <img src={club.logo} className="" />
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
            <button
              type="button"
              className="bg-gradient-to-r from-theme_primary to-theme_secondary p-3 rounded-lg text-theme_text_normal font-semibold tracking-wide"
              onClick={handleSubmit}
            >
              Join the Campus Web
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export { EventForm, ClubSignUpForm };
