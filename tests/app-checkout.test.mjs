import test from "node:test";
import assert from "node:assert/strict";
import { parseAppCheckout } from "../src/lib/app-checkout.ts";
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
