function formatDate(dateString) {
      const [day, month, year] = dateString.split('/').map(Number);
      return new Date(year, month - 1, day);
  }
  
  export function calcPlannerData(currentDate, startDate, endDate, planner, timetable, userJsonData) {
    // console.log('currentDate', currentDate, 'startDate', startDate, 'endDate', endDate, 'planner', planner, 'timetable', timetable, 'userJsonData', userJsonData);
    
    
      const formattedCurrentDate = formatDate(currentDate); 
      const formattedStartDate = formatDate(startDate); 
      const formattedEndDate = formatDate(endDate); 
  
      const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
      const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
  
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthKey = `${monthNames[startMonth - 1]} '${String(startYear).slice(-2)}`;
  
      if (!planner[monthKey]) {
          console.log(`Month ${monthKey} not found in the planner.`);
          return;
      }
  
      const days = planner[monthKey].Data;
      
    
      const allDaysInRange = days.filter(day => {
          const dayDate = new Date(startYear, startMonth - 1, parseInt(day.Date));
          return dayDate >= formattedCurrentDate && dayDate <= formattedEndDate;
      });
      const daysBeforeStart = allDaysInRange.filter(day => {
          const dayDate = new Date(startYear, startMonth - 1, parseInt(day.Date));
          return dayDate >= formattedCurrentDate && dayDate < formattedStartDate;
      });
  
      const daysAfterStart = allDaysInRange.filter(day => {
          const dayDate = new Date(startYear, startMonth - 1, parseInt(day.Date));
          return dayDate >= formattedStartDate && dayDate <= formattedEndDate;
      });
      const presentSubjectCount = daysBeforeStart.reduce((acc, day) => {
          const daySchedule = timetable.timetable[`Day${day.Dayorder}`];
          if (daySchedule) {
              Object.values(daySchedule).forEach(details => {
                  const subjectName = details.subject_name;
                  const subjectType = details.subject_type;
                  const key = `${subjectName}-${subjectType}`;
                  if (!acc[key]) {
                      acc[key] = 0;
                  }
                  acc[key]++;
              });
          }
          return acc;
      }, {});
  
      const absentSubjectCount = daysAfterStart.reduce((acc, day) => {
        
          const daySchedule = timetable.timetable[`Day${day.Dayorder}`];
          if (daySchedule) {
              Object.values(daySchedule).forEach(details => {
                  const subjectName = details.subject_name;
                  const subjectType = details.subject_type;
                  const key = `${subjectName}-${subjectType}`;
                  if (!acc[key]) {
                      acc[key] = 0;
                  }
                  acc[key]++;
              });
          }
          return acc;
      }, {});
  
      let localUserJsonData = JSON.parse(JSON.stringify(userJsonData));
      localUserJsonData.forEach(course => {
          const courseTitle = course.courseTitle;
          const courseCategory = course.category;
          const key = `${courseTitle}-${courseCategory}`;
  
          const totalOccurrences = (presentSubjectCount[key] || 0) + (absentSubjectCount[key] || 0);
  
          if (totalOccurrences > 0) {
              course.hoursConducted = (parseFloat(course.hoursConducted) + totalOccurrences).toFixed(2);
  
        
              const presentCount = presentSubjectCount[key] || 0;
              const absentCount = absentSubjectCount[key] || 0;
              course.hoursPresent = (parseFloat(course.hoursPresent) + presentCount - absentCount).toFixed(2);
  
      
              course.hoursAbsent = (parseFloat(course.hoursConducted) - parseFloat(course.hoursPresent)).toFixed(2);
  
            
              const totalHours = parseFloat(course.hoursConducted);
              const presentHours = parseFloat(course.hoursPresent);
              course.attendancePercent = ((presentHours * 100) / totalHours).toFixed(2);
  
            
              let margin = (0.25 * totalHours - parseFloat(course.hoursAbsent)) / 0.75;
              let marginInt = Math.floor(margin);
  
          
              if (marginInt < 0) {
                  const required = Math.floor((0.75 * totalHours - presentHours) / 0.25);
                  marginInt = 0;
                  console.log(`Required hours: ${required}`);
              }
  
              course.margin = marginInt;
              course.required = marginInt < 0 ? Math.floor((0.75 * totalHours - presentHours) / 0.25) : 0;
          }
      });
  
    const result = localUserJsonData.map(course => {
        return {
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          category: course.category,
          facultyName: course.facultyName,
          slot: course.slot,
          hoursConducted: course.hoursConducted,
          hoursAbsent: course.hoursAbsent,
          hoursPresent: course.hoursPresent,
          margin: course.margin,
          required: course.required,
          attendancePercent: course.attendancePercent,
          practicalDetails: course.practicalDetails
        };
    });

    // console.log('result', result);
    
    

    return result;
  }
  
  
//   calcPlannerData('17/09/24', '19/09/24', '20/09/24', planner, timetable, userJsonData);