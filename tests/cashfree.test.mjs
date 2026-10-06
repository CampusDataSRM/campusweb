import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  createOrder,
  verifyOrder,
  orderIdFor,
  validateRequestId,
} from "../src/lib/server/cashfree.ts";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
const requestId = "a".repeat(32);
beforeEach(() => {
  process.env.CASHFREE_ENV = "production";
  process.env.CASHFREE_CLIENT_ID = "production-test-id";
  process.env.CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_synthetic-test-key";
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});
const response = (data) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
const order = (status = "ACTIVE") => ({
  order_id: orderIdFor(requestId),
  order_amount: 10,
  order_currency: "INR",
  order_status: status,
  payment_session_id: "synthetic-session",
});

test("fixes the amount on the server and uses the production API", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.cashfree.com/pg/orders");
    const payload = JSON.parse(options.body);
    assert.equal(payload.order_amount, 10);
    assert.equal(payload.order_currency, "INR");
    assert.equal(payload.customer_details.customer_phone, "9876543210");
    assert.equal(
      payload.order_meta.return_url,
      "https://payment.campusweb.in/",
    );
    assert.equal(options.cache, "no-store");
    return response(order());
  };
  const result = await createOrder(
    requestId,
    "9876543210",
    "https://payment.campusweb.in",
  );
  assert.equal(result.payment_session_id, "synthetic-session");
});
test("rejects malformed IDs and phone numbers without contacting Cashfree", async () => {
  globalThis.fetch = async () => {
    throw Error("must not call provider");
  };
  assert.throws(() => validateRequestId("../orders/other"));
  await assert.rejects(
    createOrder(requestId, "123", "https://payment.campusweb.in"),
    /mobile number/,
  );
});
test("refuses missing or sandbox credentials", async () => {
  process.env.CASHFREE_ENV = "sandbox";
  await assert.rejects(
    createOrder(requestId, "9876543210", "https://payment.campusweb.in"),
    (error) => error.status === 503,
  );
});
test("recovers the same order after a failed create response", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url, options.method]);
    return options.method === "POST"
      ? new Response("", { status: 409 })
      : response(order());
  };
  await createOrder(requestId, "9876543210", "https://payment.campusweb.in");
  assert.equal(
    calls[1][0],
    "https://api.cashfree.com/pg/orders/" + orderIdFor(requestId),
  );
  assert.equal(orderIdFor(requestId), orderIdFor(requestId));
});
test("does not accept a provider order for another amount or currency", async () => {
  for (const change of [
    { order_amount: 20 },
    { order_currency: "USD" },
    { order_id: "other-order" },
  ]) {
    globalThis.fetch = async () => response({ ...order("PAID"), ...change });
    await assert.rejects(verifyOrder(requestId), /validate/);
  }
});
test("paid order requires a successful matching transaction", async () => {
  let payment = {
    payment_status: "FAILED",
    payment_amount: 10,
    payment_currency: "INR",
    cf_payment_id: 123,
  };
  globalThis.fetch = async (url) =>
    response(url.endsWith("/payments") ? [payment] : order("PAID"));
  assert.equal((await verifyOrder(requestId)).status, "pending");
  payment = { ...payment, payment_status: "SUCCESS", payment_amount: 20 };
  assert.equal((await verifyOrder(requestId)).status, "pending");
  payment = { ...payment, payment_amount: 10 };
  assert.equal((await verifyOrder(requestId)).status, "paid");
});
test("pending, expired, and not-yet-created orders can recover safely", async () => {
  globalThis.fetch = async () => response(order());
  assert.equal((await verifyOrder(requestId)).status, "pending");
  globalThis.fetch = async () => response(order("EXPIRED"));
  assert.equal((await verifyOrder(requestId)).status, "expired");
  globalThis.fetch = async () => new Response("", { status: 404 });
  assert.equal((await verifyOrder(requestId)).status, "not_created");
});
