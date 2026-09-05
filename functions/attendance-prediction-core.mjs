const normalizeTitle = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const componentAgnosticTitle = (value) =>
  normalizeTitle(value)
    .split(" ")
    .filter(
      (word) =>
        !["theory", "practical", "laboratory", "lab", "tutorial"].includes(
          word,
        ),
    )
    .join(" ");

const significantWords = (value) =>
  new Set(
    value
      .split(" ")
      .filter(
        (word) =>
          word.length > 2 &&
          !["and", "for", "the", "with", "from"].includes(word),
      ),
  );

export const isMergedTheoryPracticalCourse = (course) => {
  if (course?.studentPortalMergedAttendance === true) return true;

  const code = String(course?.courseCode ?? "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/REGULAR$/, "");
  const category = normalizeTitle(course?.category);
  return (
    code.endsWith("J") &&
    (category === "theory practical" ||
      category === "theory and practical")
  );
};

export const timetableSubjectMatchesCourse = (
  timetableSubject,
  courseTitle,
  allowTheoryPracticalVariants = false,
) => {
  const subject = normalizeTitle(timetableSubject);
  const course = normalizeTitle(courseTitle);
  if (!subject || !course) return false;
  if (
    subject === course ||
    subject.includes(course) ||
    course.includes(subject)
  ) {
    return true;
  }
  if (!allowTheoryPracticalVariants) return false;

  const subjectBase = componentAgnosticTitle(subject);
  const courseBase = componentAgnosticTitle(course);
  if (!subjectBase || !courseBase) return false;
  if (
    subjectBase === courseBase ||
    subjectBase.includes(courseBase) ||
    courseBase.includes(subjectBase)
  ) {
    return true;
  }

  const subjectWords = significantWords(subjectBase);
  const courseWords = significantWords(courseBase);
  if (!subjectWords.size || !courseWords.size) return false;
  const overlap = [...subjectWords].filter((word) => courseWords.has(word)).length;
  const shorterSize = Math.min(subjectWords.size, courseWords.size);
  return overlap >= 2 && overlap / shorterSize >= 0.75;
};

export const countCourseOccurrences = (counts, course) => {
  const merged = isMergedTheoryPracticalCourse(course);
  return Object.entries(counts).reduce((total, [subject, count]) => {
    return timetableSubjectMatchesCourse(subject, course?.courseTitle, merged)
      ? total + count
      : total;
  }, 0);
};

export const normalizeAttendanceTitle = normalizeTitle;
