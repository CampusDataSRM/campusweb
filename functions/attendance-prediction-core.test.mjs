import assert from "node:assert/strict";
import test from "node:test";
import {
  countCourseOccurrences,
  isMergedTheoryPracticalCourse,
  timetableSubjectMatchesCourse,
} from "./attendance-prediction-core.mjs";

test("combines theory and practical timetable names for a merged J-course", () => {
  const course = {
    courseCode: "26CYB1002J",
    courseTitle: "Chemistry for Computer Science",
    category: "Theory and Practical",
  };
  const counts = {
    "chemistry for computer science": 1,
    "chemistry practical for computer science": 2,
  };

  assert.equal(isMergedTheoryPracticalCourse(course), true);
  assert.equal(countCourseOccurrences(counts, course), 3);
});

test("does not apply component-agnostic matching to an ordinary course", () => {
  assert.equal(
    timetableSubjectMatchesCourse(
      "Chemistry Practical for Computer Science",
      "Chemistry for Computer Science",
      false,
    ),
    false,
  );
});

test("accepts the persisted CampusApp merged marker", () => {
  assert.equal(
    isMergedTheoryPracticalCourse({
      courseCode: "26CYB1002J",
      category: "Theory",
      studentPortalMergedAttendance: true,
    }),
    true,
  );
});
