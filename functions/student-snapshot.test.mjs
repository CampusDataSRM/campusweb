import assert from "node:assert/strict";
import test from "node:test";
import { mergeStudentSnapshot } from "./student-snapshot.mjs";

test("preserves cached attendance and marks when a refresh is empty", () => {
  const cached = { courses: [{ courseCode: "A" }], testPerformances: [{ courseCode: "M" }] };
  const merged = mergeStudentSnapshot({ name: "Student", courses: [], testPerformances: null }, cached);
  assert.deepEqual(merged.courses, cached.courses);
  assert.deepEqual(merged.testPerformances, cached.testPerformances);
  assert.equal(merged.name, "Student");
});

test("accepts non-empty refreshed attendance and marks", () => {
  const live = { courses: [{ courseCode: "B" }], testPerformances: [{ courseCode: "N" }] };
  const merged = mergeStudentSnapshot(live, { courses: [], testPerformances: [] });
  assert.deepEqual(merged.courses, live.courses);
  assert.deepEqual(merged.testPerformances, live.testPerformances);
});

test("ignores malformed refresh payloads", () => {
  const cached = { courses: [{ courseCode: "A" }] };
  assert.equal(mergeStudentSnapshot(undefined, cached), cached);
});
