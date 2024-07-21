import { useState, useRef } from "react";

const defaultStyle =
  "theme_box_bg px-3 py-4 rounded-lg text-theme_text_normal tracking-wide caret-theme_text_primary placeholder:text-theme_text_primary placeholder:text-sm shadow-xl";

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
  };

  const onFormChange = (e) => {
    if (e.target.name == "OD" || e.target.name == "refreshment") {
      setEvent({ ...event, [e.target.name]: !event[e.target.name] });
    } else if (e.target.name == "image") {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setEvent({ ...event, image: reader.result });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    } 
    else {
      setEvent({ ...event, [e.target.name]: e.target.value });
    }
  };
  return (
    <>
      <div className="px-3 py-5">
        <div className="text-theme_text_primary flex justify-start gap-2 content-center text-xl py-4">
          Create Event
        </div>
        <div>
          <form className="grid grid-cols-1 gap-4">
            <button className={`${defaultStyle} min-h-40`} onClick={() => fileUpload.current.click()}>
              <div className="flex flex-col justify-center items-center h-full">
                <input
                  type="file"
                  placeholder="Event Image"
                  className={`hidden`}
                  name="image"
                  ref={fileUpload}
                  onChange={onFormChange}
                />
                <img src="/icons/camera/secondary.svg" className="w-7" />
                <span className="text-theme_text_primary/80 text-sm py-2">Upload Banner (2:1 Ratio preffered)</span>
                <img src={event.image} className="" />
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
                placeholder="Start Date"
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
                type="Time"
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
                type="Time"
                placeholder="Start Date"
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
                  id="refeshment"
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
              Create Event
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

const ProfileForm = () => {
  return (
    <>
      <div></div>
    </>
  );
};

export { EventForm, ProfileForm };
