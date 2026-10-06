import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { checkoutOrigin } from "../src/lib/server/checkout-origin.ts";
const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});
function request(origin, headers = {}) {
  return new Request("http://internal-service:8080/api/payment/order", {
    headers: { ...(origin ? { Origin: origin } : {}), ...headers },
  });
}
test("accepts the public checkout origin behind an internal hosting URL", () => {
  delete process.env.PAYMENT_SITE_URL;
  process.env.NODE_ENV = "production";
  assert.equal(
    checkoutOrigin(request("https://payment.campusweb.in")),
    "https://payment.campusweb.in",
  );
});
test("rejects unrelated or missing origins and ignores spoofed forwarded hosts", () => {
  process.env.PAYMENT_SITE_URL = "https://payment.campusweb.in";
  for (const origin of [
    undefined,
    "null",
    "https://evil.example",
    "http://payment.campusweb.in",
  ]) {
    assert.throws(() =>
      checkoutOrigin(
        request(origin, {
          "x-forwarded-host": "evil.example",
          "x-forwarded-proto": "https",
        }),
      ),
    );
  }
});
test("uses an explicit public deployment origin for payment returns", () => {
  process.env.PAYMENT_SITE_URL = "https://preview.example/";
  assert.equal(
    checkoutOrigin(request("https://preview.example")),
    "https://preview.example",
  );
});
test("allows local development and rejects invalid configured URLs", () => {
  delete process.env.PAYMENT_SITE_URL;
  process.env.NODE_ENV = "development";
  const local = new Request("http://localhost:2560/api/payment/order", {
    headers: { Origin: "http://localhost:2560" },
  });
  assert.equal(checkoutOrigin(local), "http://localhost:2560");
  for (const origin of [
    "not-a-url",
    "https://payment.campusweb.in/extra",
    "http://evil.example",
    "https://user:password@example.com",
  ]) {
    process.env.PAYMENT_SITE_URL = origin;
    assert.throws(() => checkoutOrigin(local));
  }
});
