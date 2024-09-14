import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

const CWDateRangePicker = ({ setStartDate, setEndDate }) => {
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  // List of holiday dates
  const holidays = [
    new Date(2024, 11, 25), // Christmas
    new Date(2024, 0, 1), // New Year
    new Date(2024, 6, 4), // Independence Day
    // new Date(2024, 8, 10)
    // Add more holidays here
  ];

  const handleSelect = (ranges) => {
    // console.log("ranges", ranges);
    setSelectionRange(ranges.selection);

    const startDate = ranges.selection.startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const endDate = ranges.selection.endDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    setStartDate(startDate);
    setEndDate(endDate);
  };

  // Function to render custom content for each day
  const renderDayContent = (day) => {
    const isHoliday = holidays.some(
      (holiday) =>
        holiday.getDate() === day.getDate() &&
        holiday.getMonth() === day.getMonth() &&
        holiday.getFullYear() === day.getFullYear()
    );

    return (
      <div
        style={{
          position: "relative",
          color: isHoliday ? "inherit" : "inherit",
          fontWeight: isHoliday ? "bold" : "normal",
          display: "flex",
        }}
      >
        {day.getDate()}
        {isHoliday && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              // backgroundColor: '#02cf37',
              color: "#02cf37",
              borderRadius: "100%",
              padding: "12px 0px",
              // margin: '4px 10px',
              fontSize: "0.7em",
              width: "7px",
              height: "8px",
              // direction: 'rtl',
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            Holiday
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="translucent-date-range flex justify-center">
      <DateRange
        ranges={[selectionRange]}
        onChange={handleSelect}
        dayContentRenderer={renderDayContent}
        rangeColors={["#91C3E7"]}
      />
    </div>
  );
};

export default CWDateRangePicker;
