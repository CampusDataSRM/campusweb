import assert from "node:assert/strict";
import test from "node:test";
import {
  STUDENT_PORTAL_SESSION_MARKER,
  isStudentPortalSession,
} from "./session-type.mjs";

test("recognises the web Student Portal session marker", () => {
  assert.equal(isStudentPortalSession(STUDENT_PORTAL_SESSION_MARKER), true);
  assert.equal(isStudentPortalSession("sp_session=opaque"), true);
});

test("does not classify Academia or evaluator sessions as Student Portal", () => {
  assert.equal(isStudentPortalSession("academia-cookie"), false);
  assert.equal(isStudentPortalSession("campusweb_demo"), false);
  assert.equal(isStudentPortalSession(), false);
});
