import assert from "node:assert/strict";
import test from "node:test";
import { predictAttendance } from "./attendance-prediction.js";

test("projects theory and practical slots into one merged attendance course", async () => {
  const result = await predictAttendance(
    {
      "Jul '26": {
        Data: [
          { Date: "28", Dayorder: "1" },
          { Date: "29", Dayorder: "2" },
        ],
      },
    },
    {
      timetable: {
        Day1: {
          slot1: {
            subject_name: "Chemistry for Computer Science",
            subject_type: "Theory",
          },
        },
        Day2: {
          slot1: {
            subject_name: "Chemistry Practical for Computer Science",
            subject_type: "Practical",
          },
        },
      },
    },
    [
      {
        courseCode: "26CYB1002J",
        courseTitle: "Chemistry for Computer Science",
        category: "Theory and Practical",
        hoursConducted: "10",
        hoursPresent: "8",
      },
    ],
    "28/07/26",
    "29/07/26",
    "29/07/26",
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].hoursConducted, "12.00");
  assert.equal(result[0].hoursPresent, "9.00");
  assert.equal(result[0].hoursAbsent, "3.00");
  assert.equal(result[0].attendancePercent, "75.00");
});

test("prediction does not mutate cached source courses", async () => {
  const source = [
    {
      courseCode: "MAT101",
      courseTitle: "Mathematics",
      category: "Theory",
      hoursConducted: "10",
      hoursPresent: "8",
    },
  ];

  await predictAttendance(
    { "Jul '26": { Data: [{ Date: "28", Dayorder: "1" }] } },
    {
      timetable: {
        Day1: {
          slot1: { subject_name: "Mathematics", subject_type: "Theory" },
        },
      },
    },
    source,
    "28/07/26",
    "29/07/26",
    "29/07/26",
  );

  assert.equal(source[0].hoursConducted, "10");
  assert.equal(source[0].hoursPresent, "8");
});
