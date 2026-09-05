import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeDemoTokenExpiry,
  isDemoNetId,
  normalizeStudentNetId,
} from "./demo-session.mjs";

test("routes bare and domain-appended evaluator NetIDs to demo", () => {
  assert.equal(isDemoNetId("campusdemo"), true);
  assert.equal(isDemoNetId(" CampusDemo@srmist.edu.in "), true);
});

test("ordinary NetIDs bypass demo authentication", () => {
  assert.equal(isDemoNetId("aa4709@srmist.edu.in"), false);
  assert.equal(normalizeStudentNetId("AA4709@srmist.edu.in"), "aa4709");
});

test("reads expiry and rejects malformed demo tokens", () => {
  const payload = Buffer.from(JSON.stringify({ exp: 2_000_000_000 }))
    .toString("base64url");
  assert.equal(decodeDemoTokenExpiry(`${payload}.signature`), 2_000_000_000_000);
  assert.equal(decodeDemoTokenExpiry("not-a-token"), 0);
});
