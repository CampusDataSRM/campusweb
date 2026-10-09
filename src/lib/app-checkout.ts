export interface AppCheckout {
  orderId: string;
  sessionId: string;
  amount: number;
}

export type AppCheckoutReceipt = Pick<AppCheckout, "orderId" | "amount">;
export const appCheckoutReceiptKey = "campus_app_checkout_receipt_v1";
const receiptLifetime = 60 * 60 * 1000;

export function parseAppCheckoutReturn(
  search: string,
): AppCheckoutReceipt | null {
  const params = new URLSearchParams(search);
  if (!params.has("return_order")) return null;
  const orderId = params.get("return_order") ?? "";
  const amount = Number(params.get("amount"));
  if (
    !/^cf_[a-f0-9]{40}$/.test(orderId) ||
    ![10, 12, 15, 20].includes(amount)
  ) {
    throw new Error("Return to Campus App to check your payment.");
  }
  return { orderId, amount };
}

export function appCheckoutReturnPath(
  data: AppCheckoutReceipt,
  embedded: boolean,
) {
  const params = new URLSearchParams({
    return_order: data.orderId,
    amount: String(data.amount),
  });
  if (embedded) params.set("embedded", "1");
  return `/app?${params}`;
}

// Persist only a receipt hint. The provider session is never stored here.
export function serializeAppCheckoutReceipt(
  data: AppCheckoutReceipt,
  now = Date.now(),
) {
  return JSON.stringify({
    orderId: data.orderId,
    amount: data.amount,
    savedAt: now,
  });
}

export function parseAppCheckoutReceipt(
  value: string | null,
  now = Date.now(),
): AppCheckoutReceipt {
  const data = JSON.parse(value ?? "null");
  if (
    !data ||
    typeof data.orderId !== "string" ||
    !/^cf_[a-f0-9]{40}$/.test(data.orderId) ||
    ![10, 12, 15, 20].includes(data.amount) ||
    typeof data.savedAt !== "number" ||
    data.savedAt > now + 60_000 ||
    now - data.savedAt > receiptLifetime
  ) {
    throw new Error("Return to Campus App to check your payment.");
  }
  return { orderId: data.orderId, amount: data.amount };
}

export function appPaymentReturnUrl(data: AppCheckoutReceipt) {
  if (
    !/^cf_[a-f0-9]{40}$/.test(data.orderId) ||
    ![10, 12, 15, 20].includes(data.amount)
  ) {
    throw new Error("Invalid payment receipt.");
  }
  const query = new URLSearchParams({
    order_id: data.orderId,
    amount: String(data.amount),
  });
  return `intent://payment-return?${query}#Intent;scheme=campusweb;package=com.campusweb.campusapp;end`;
}

export function parseAppCheckout(fragment: string): AppCheckout {
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  const orderId = params.get("order_id") ?? "";
  const sessionId = params.get("payment_session_id") ?? "";
  const amount = Number(params.get("amount"));
  if (
    !/^cf_[a-f0-9]{40}$/.test(orderId) ||
    !sessionId.trim() ||
    sessionId.length > 4096 ||
    ![10, 12, 15, 20].includes(amount)
  ) {
    throw new Error("Open this checkout from Campus App to continue.");
  }
  return { orderId, sessionId, amount };
}
