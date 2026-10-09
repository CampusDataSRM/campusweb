import test from "node:test";
import assert from "node:assert/strict";
import {
  parseAppCheckout,
  serializeAppCheckoutReceipt,
  parseAppCheckoutReceipt,
  appPaymentReturnUrl,
  appCheckoutReturnPath,
  parseAppCheckoutReturn,
} from "../src/lib/app-checkout.ts";
const id = "cf_" + "a".repeat(40);
test("parses the app handoff with its selected amount", () => {
  const result = parseAppCheckout(
    "#" +
      new URLSearchParams({
        order_id: id,
        payment_session_id: "synthetic-session",
        amount: "15",
      }),
  );
  assert.deepEqual(result, {
    orderId: id,
    sessionId: "synthetic-session",
    amount: 15,
  });
});

test("reload restores a receipt without persisting the provider session", () => {
  const launch = {
    orderId: id,
    amount: 10,
    sessionId: "sensitive-provider-session",
  };
  const saved = serializeAppCheckoutReceipt(launch, 100_000);
  assert.equal(saved.includes(launch.sessionId), false);
  assert.deepEqual(parseAppCheckoutReceipt(saved, 150_000), {
    orderId: id,
    amount: 10,
  });
});

test("Cashfree return remains verifiable when a new browser tab has no storage", () => {
  const data = { orderId: id, amount: 10, sessionId: "private-session" };
  const path = appCheckoutReturnPath(data, true);
  assert.equal(path.includes(data.sessionId), false);
  assert.deepEqual(
    parseAppCheckoutReturn(
      new URL(path, "https://payment.campusweb.in").search,
    ),
    { orderId: id, amount: 10 },
  );
  assert.equal(parseAppCheckoutReturn("?embedded=1"), null);
  assert.throws(() => parseAppCheckoutReturn("?return_order=other&amount=10"));
});

test("stale, forged and unsupported receipts cannot resume checkout", () => {
  for (const value of [
    null,
    "garbage",
    "{}",
    serializeAppCheckoutReceipt({ orderId: "other", amount: 10 }, 100_000),
    serializeAppCheckoutReceipt({ orderId: id, amount: 999 }, 100_000),
    serializeAppCheckoutReceipt({ orderId: id, amount: 10 }, -4_000_000),
    serializeAppCheckoutReceipt({ orderId: id, amount: 10 }, 300_000),
  ])
    assert.throws(() => parseAppCheckoutReceipt(value, 100_000));
});

test("return targets only CampusApp and carries no paid status or session", () => {
  const url = appPaymentReturnUrl({ orderId: id, amount: 15 });
  assert.equal(
    url,
    `intent://payment-return?order_id=${id}&amount=15#Intent;scheme=campusweb;package=com.campusweb.campusapp;end`,
  );
  assert.equal(url.includes("payment_session_id"), false);
  assert.equal(url.includes("status"), false);
  assert.throws(() =>
    appPaymentReturnUrl({ orderId: "bad;package=other", amount: 10 }),
  );
});
test("invalid or standalone order handoffs cannot launch an app checkout", () => {
  for (const fragment of [
    "",
    "#order_id=other",
    "#order_id=web_" +
      "a".repeat(40) +
      "&payment_session_id=synthetic&amount=10",
    "#order_id=" + id + "&payment_session_id=synthetic&amount=999",
    "#order_id=" + id + "&payment_session_id=&amount=10",
  ]) {
    assert.throws(() => parseAppCheckout(fragment));
  }
});
