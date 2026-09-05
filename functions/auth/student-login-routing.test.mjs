import assert from "node:assert/strict";
import test from "node:test";
import {
  extractStudentPortalSemester,
  usesStudentPortalPrimary,
} from "./student-login-routing.mjs";

test("recognises first year across supported Student Portal payloads", () => {
  for (const payload of [
    { semester_id: 1 },
    { semesterid: "2" },
    { student: { semesterId: 1 } },
    { student: { registerno: "RA2611003010225" } },
  ]) {
    assert.equal(usesStudentPortalPrimary(payload), true);
  }
});

test("does not route upper years through Student Portal-primary flow", () => {
  assert.equal(usesStudentPortalPrimary({ semester_id: 7 }), false);
  assert.equal(
    usesStudentPortalPrimary({ student: { registerno: "RA2311033010136" } }),
    false,
  );
  assert.equal(usesStudentPortalPrimary({}), false);
});

test("normalises valid semesters and rejects missing or invalid values", () => {
  assert.equal(extractStudentPortalSemester({ student: { semesterid: "1" } }), 1);
  assert.equal(extractStudentPortalSemester({ semester_id: "" }), null);
  assert.equal(extractStudentPortalSemester({ semester_id: "first" }), null);
});
