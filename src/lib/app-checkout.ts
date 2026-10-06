export interface AppCheckout {
  orderId: string;
  sessionId: string;
  amount: number;
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
