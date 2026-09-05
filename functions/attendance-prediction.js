import {
  countCourseOccurrences,
  normalizeAttendanceTitle,
} from "./attendance-prediction-core.mjs";

export const predictAttendance = async (
  calendar,
  userTimetable,
  courseData,
  currentDate,
  startDate,
  endDate
) => {
  const planner = calendar;
  const timetable = userTimetable;
  // Predictions are temporary UI state. Never mutate the cached server
  // snapshot kept in localStorage.
  const userJsonData = Array.isArray(courseData)
    ? courseData.map((course) => ({ ...course }))
    : [];

  // Helper function to format dates for comparison
  function formatDate(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  function getDayOrder(currentDate, startDate, endDate) {
    const formattedCurrentDate = formatDate(currentDate); // e.g., 14/10/24
    const formattedStartDate = formatDate(startDate); // e.g., 28/10/24
    const formattedEndDate = formatDate(endDate); // e.g., 07/11/24

    const [currentDay, currentMonth, currentYear] = currentDate
      .split("/")
      .map(Number);
    const [startDay, startMonth, startYear] = startDate.split("/").map(Number);
    const [endDay, endMonth, endYear] = endDate.split("/").map(Number);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Fetch data from planner for all relevant months
    let days = [];

    // Loop through the range of months from the current month to the end month
    for (let year = currentYear; year <= endYear; year++) {
      let startM = year === currentYear ? currentMonth : 1; // Start from the current month in the first year
      let endM = year === endYear ? endMonth : 12; // End at the end month in the last year

      for (let month = startM; month <= endM; month++) {
        const monthKey = `${monthNames[month - 1]} '${String(year).slice(-2)}`; // Generate month key

        if (planner[monthKey]) {
          // Append days to the days array, but adjust the year and month accordingly
          const monthDays = planner[monthKey].Data.map((day) => ({
            ...day,
            Date: `${day.Date}/${month}/${year}`, // Adjust the day date to include correct month/year
          }));
          days = days.concat(monthDays);
        }
      }
    }

    // Filter days from current date to end date
    const allDaysInRange = days.filter((day) => {
      const dayDate = formatDate(day.Date); // Parse date from the day object
      return dayDate >= formattedCurrentDate && dayDate <= formattedEndDate;
    });

    // Separate days for present (before start date) and absent (after start date)
    const daysBeforeStart = allDaysInRange.filter((day) => {
      const dayDate = formatDate(day.Date);
      return dayDate >= formattedCurrentDate && dayDate < formattedStartDate;
    });

    const daysAfterStart = allDaysInRange.filter((day) => {
      const dayDate = formatDate(day.Date);
      return dayDate >= formattedStartDate && dayDate <= formattedEndDate;
    });

    // Count occurrences of each subject for both present and absent periods
    const presentSubjectCount = daysBeforeStart.reduce((acc, day) => {
      if (day.Dayorder === "-") return acc; // Skip holidays
      const daySchedule = timetable.timetable[`Day${day.Dayorder}`];
      if (daySchedule) {
        Object.values(daySchedule).forEach((details) => {
          const subjectName = details.subject_name;
          const key = normalizeAttendanceTitle(subjectName);
          if (!key || key === "no class" || key === "n a") return;
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key]++;
        });
      }
      return acc;
    }, {});

    const absentSubjectCount = daysAfterStart.reduce((acc, day) => {
      if (day.Dayorder === "-") return acc; // Skip holidays
      const daySchedule = timetable.timetable[`Day${day.Dayorder}`];
      if (daySchedule) {
        Object.values(daySchedule).forEach((details) => {
          const subjectName = details.subject_name;
          const key = normalizeAttendanceTitle(subjectName);
          if (!key || key === "no class" || key === "n a") return;
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key]++;
        });
      }
      return acc;
    }, {});

    // Update course data based on the counts
    userJsonData.forEach((course) => {
      const courseTitle = course.courseTitle;
      const presentCount = countCourseOccurrences(presentSubjectCount, course);
      const absentCount = countCourseOccurrences(absentSubjectCount, course);
      const totalOccurrences = presentCount + absentCount;

      if (totalOccurrences > 0) {
        // Update hoursConducted
        course.hoursConducted = (
          (parseFloat(course.hoursConducted) || 0) + totalOccurrences
        ).toFixed(2);

        // Update hoursPresent (only increment from presentSubjectCount)
        course.hoursPresent = (
          (parseFloat(course.hoursPresent) || 0) + presentCount
        ).toFixed(2);

        // Update hoursAbsent as (hoursConducted - hoursPresent)
        course.hoursAbsent = (
          parseFloat(course.hoursConducted) - parseFloat(course.hoursPresent)
        ).toFixed(2);

        // Recalculate attendance percentage
        const totalHours = parseFloat(course.hoursConducted);
        const presentHours = parseFloat(course.hoursPresent);
        course.attendancePercent = ((presentHours * 100) / totalHours).toFixed(
          2
        );

        // Calculate the margin and convert it to an integer by truncation
        let margin =
          (0.25 * totalHours - parseFloat(course.hoursAbsent)) / 0.75;
        let marginInt = Math.floor(margin);

        // Calculate required hours if margin is negative
        let required = 0;
        if (marginInt < 0) {
          required = Math.floor((0.75 * totalHours - presentHours) / 0.25);
          marginInt = 0; // Reset margin to 0 since we're now below the 75% threshold
        }

        // Update the course object with calculated margin and required values
        course.margin = marginInt;
        course.required = required;
      }
    });

    return userJsonData;
  }

  try {
    const result = getDayOrder(currentDate, startDate, endDate);
    return result;
  } catch (error) {
    console.error(error);
  }
};
