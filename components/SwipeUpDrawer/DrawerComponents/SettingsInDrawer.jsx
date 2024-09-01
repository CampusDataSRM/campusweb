export default function SettingsInDrawer({
  setDrawer,
  currentDay,
  setCurrentDay,
  currentTime,
  setCurrentTime,
  messName,
  setMessName,
}) {

  const handeMessNameChange = (e) => {
    setMessName(e.target.value); 
  }

  return (
    <div className="flex flex-col w-3/4 gap-5 items-center">
      {console.log("ASDF", messName)}
      <select
        defaultValue={localStorage.getItem("localMessName") || "Sannasi"}
        onChange={handeMessNameChange}
        className="theme_box_bg text-slate-50 rounded-lg py-4 px-2 cardColors w-full"
        name="hostel"
        id="hostel"
      >
        {/* <option value="">Mess</option> */}
        <option value="Sannasi" className="text-slate-900">Sannasi / Agasthiyar / D-Mess</option>
        <option value="MBlock / PF" className="text-slate-900">M Block / PF</option>
        {/* <option value="PF">PF</option> */}
      </select>
      <select
        value={currentDay}
        onChange={(e) => setCurrentDay(e.target.value)}
        className="theme_box_bg text-slate-50 rounded-lg py-4 px-2 cardColors w-full"
        name="time"
        id="time"
      >
        {/* <option value="">Day</option> */}
        <option value="monday" className="text-slate-900">Monday</option>
        <option value="tuesday" className="text-slate-900">Tuesday</option>
        <option value="wednesday" className="text-slate-900">Wednesday</option>
        <option value="thursday" className="text-slate-900">Thursday</option>
        <option value="friday" className="text-slate-900">Friday</option>
        <option value="saturday" className="text-slate-900">Saturday</option>
        <option value="sunday" className="text-slate-900">Sunday</option>
      </select>
      <select
        value={currentTime}
        onChange={(e) => setCurrentTime(e.target.value)}
        className="theme_box_bg text-slate-50 rounded-lg py-4 px-2 cardColors w-full"
        name="day"
        id="day"
      >
        {/* <option value="">Time</option> */}
        <option value="Breakfast" className="text-slate-900">Breakfast</option>
        <option value="Lunch" className="text-slate-900">Lunch</option>
        <option value="Snacks" className="text-slate-900">Snacks</option>
        <option value="Dinner" className="text-slate-900">Dinner</option>
      </select>
      <button
        className="bg-[#0094FF] max-w-fit text-white px-7 py-2 rounded-lg"
        onClick={() => setDrawer(null)}
      >
        Done
      </button>
    </div>
  );
}
