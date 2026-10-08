import test from "node:test";
import assert from "node:assert/strict";
import { startQrLogin, qrPayload } from "../src/lib/auth/qr-login.ts";

const base = "https://api.example.test/api";
const channel = {
  channelId: "channel/test",
  webSecret: "synthetic-secret",
  expiresInSeconds: 90,
};
const flush = async () => {
  for (let i = 0; i < 15; i++) await Promise.resolve();
};
function setup(t, responses) {
  t.mock.timers.enable({
    apis: ["setTimeout", "setInterval", "Date"],
    now: 1000,
  });
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    const result = responses.shift();
    if (result instanceof Error) throw result;
    return { ok: true, json: async () => result };
  });
  const views = [],
    approvals = [];
  const stop = startQrLogin(
    base,
    (v) => views.push(v),
    async (v) => {
      approvals.push(v);
    },
  );
  return { calls, views, approvals, stop };
}

test("QR carries only the channel, never the web secret", () => {
  assert.equal(
    qrPayload(channel.channelId),
    "campusweb://qr-login?v=1&ch=channel%2Ftest",
  );
});
test("scanned then approved enters session once and stops all polling", async (t) => {
  const s = setup(t, [
    channel,
    { status: "scanned" },
    { status: "approved", netId: "AB1234", cookies: "synthetic-cookie" },
  ]);
  await flush();
  assert.equal(s.calls[0].options.method, "POST");
  assert.equal(s.calls[0].options.body, undefined);
  assert.equal(s.calls[0].options.cache, "no-store");
  assert.equal(JSON.stringify(s.views).includes(channel.webSecret), false);
  t.mock.timers.tick(2000);
  await flush();
  assert.equal(s.views.at(-1).status, "scanned");
  assert.equal(s.calls[1].url.searchParams.get("webSecret"), channel.webSecret);
  t.mock.timers.tick(2000);
  await flush();
  assert.deepEqual(s.approvals, [
    { netId: "AB1234", cookies: "synthetic-cookie" },
  ]);
  t.mock.timers.tick(100000);
  await flush();
  assert.equal(s.calls.length, 3);
  s.stop();
});
for (const status of ["denied", "expired", "consumed"]) {
  test(`${status} removes QR and stops polling`, async (t) => {
    const s = setup(t, [channel, { status }]);
    await flush();
    t.mock.timers.tick(2000);
    await flush();
    assert.equal(s.views.at(-1).status, status);
    assert.equal(s.views.at(-1).channelId, undefined);
    t.mock.timers.tick(100000);
    await flush();
    assert.equal(s.calls.length, 2);
    assert.equal(s.approvals.length, 0);
  });
}
test("local expiry stops even a stalled request", async (t) => {
  const s = setup(t, [{ ...channel, expiresInSeconds: 1 }]);
  await flush();
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(s.views.at(-1).status, "expired");
  assert.equal(s.calls.length, 1);
});
test("cancelled channel cannot apply a late approval", async (t) => {
  const s = setup(t, [channel]);
  await flush();
  let resolve;
  globalThis.fetch = async () =>
    new Promise((r) => {
      resolve = r;
    });
  t.mock.timers.tick(2000);
  await flush();
  s.stop();
  resolve({
    ok: true,
    json: async () => ({
      status: "approved",
      netId: "AB1234",
      cookies: "synthetic-cookie",
    }),
  });
  await flush();
  assert.equal(s.approvals.length, 0);
});
test("request failure is terminal and does not expose API errors", async (t) => {
  const s = setup(t, [channel, new Error("synthetic-secret")]);
  await flush();
  t.mock.timers.tick(2000);
  await flush();
  assert.equal(s.views.at(-1).status, "error");
  assert.equal(JSON.stringify(s.views).includes(channel.webSecret), false);
});
test("HTTP API configuration is rejected before creating a channel", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch");
  const views = [];
  startQrLogin(
    "http://api.example.test",
    (v) => views.push(v),
    async () => {},
  );
  await flush();
  assert.equal(fetch.mock.callCount(), 0);
  assert.equal(views.at(-1).status, "error");
});

test("QR approval carries unified Academia session metadata", async (t) => {
  const approval = {
    status: "approved",
    netId: "AB1234",
    cookies: "synthetic-cookie",
    sessionToken: "synthetic-unified",
    sessionId: "session-1",
    provider: "academia",
  };
  const s = setup(t, [channel, approval]);
  await flush();
  assert.equal(s.calls[0].options.headers["X-Client"], "web");
  assert.ok(s.calls[0].options.headers["X-Device-Platform"]);
  assert.ok(s.calls[0].options.headers["X-Device-Model"]);
  assert.ok(s.calls[0].options.headers["X-App-Version"]);
  t.mock.timers.tick(2000);
  await flush();
  const { status, ...expected } = approval;
  assert.deepEqual(s.approvals, [expected]);
});
test("Student Portal QR approval does not require Academia cookies", async (t) => {
  const s = setup(t, [
    channel,
    {
      status: "approved",
      netId: "AB1234",
      sessionToken: "synthetic-unified",
      provider: "student_portal",
    },
  ]);
  await flush();
  t.mock.timers.tick(2000);
  await flush();
  assert.equal(s.approvals[0].provider, "student_portal");
  assert.equal(s.approvals[0].sessionToken, "synthetic-unified");
});

test("server QR payload and absolute expiry work without a legacy web secret", async (t) => {
  const payload = "campusweb://qr-login?v=1&ch=server-channel";
  const s = setup(t, [
    {
      channelId: "server-channel",
      qrPayload: payload,
      expiresAt: new Date(91000).toISOString(),
    },
    {
      status: "approved",
      netId: "AB1234",
      sessionToken: "synthetic-unified",
      provider: "student_portal",
    },
  ]);
  await flush();
  assert.equal(s.views.at(-1).qrPayload, payload);
  assert.equal(s.views.at(-1).seconds, 90);
  t.mock.timers.tick(2000);
  await flush();
  assert.equal(s.calls[1].url.searchParams.get("channelId"), "server-channel");
  assert.equal(s.calls[1].url.searchParams.has("webSecret"), false);
  assert.equal(s.approvals.length, 1);
});

test("a QR payload containing the web secret is rejected before rendering", async (t) => {
  const s = setup(t, [
    {
      ...channel,
      qrPayload: `campusweb://qr-login?v=1&ch=test&webSecret=${channel.webSecret}`,
    },
  ]);
  await flush();
  assert.equal(s.views.at(-1).status, "error");
  assert.equal(JSON.stringify(s.views).includes(channel.webSecret), false);
});

test("expired server codes stop before polling", async (t) => {
  const s = setup(t, [
    {
      channelId: "test",
      qrPayload: "campusweb://qr-login?v=1&ch=test",
      expiresAt: new Date(500).toISOString(),
    },
  ]);
  await flush();
  assert.equal(s.views.at(-1).status, "error");
  t.mock.timers.tick(100000);
  await flush();
  assert.equal(s.calls.length, 1);
});
