import { createHmac } from "node:crypto";

export class PaymentError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}
function config() {
  const id = process.env.CASHFREE_CLIENT_ID?.trim();
  const secret = process.env.CASHFREE_CLIENT_SECRET?.trim();
  if (
    process.env.CASHFREE_ENV !== "production" ||
    !id ||
    id.startsWith("TEST") ||
    !secret?.startsWith("cfsk_ma_prod_")
  )
    throw new PaymentError(
      "Payment checkout is not configured. Please contact support.",
      503,
    );
  return { id, secret };
}
export function validateRequestId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-f0-9]{32}$/.test(value))
    throw new PaymentError(
      "Invalid checkout request. Refresh and try again.",
      400,
    );
  return value;
}
export function orderIdFor(requestId: string) {
  return (
    "web_" +
    createHmac("sha256", config().secret)
      .update("payment:" + validateRequestId(requestId))
      .digest("hex")
      .slice(0, 40)
  );
}
interface Order {
  order_id: string;
  order_status: string;
  order_amount: number;
  order_currency: string;
  payment_session_id?: string;
}
interface Payment {
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  cf_payment_id: string | number;
}
async function request<T>(path: string, payload?: object): Promise<T> {
  const { id, secret } = config();
  const response = await fetch("https://api.cashfree.com/pg" + path, {
    method: payload ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": id,
      "x-client-secret": secret,
      "x-api-version": "2025-01-01",
    },
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok)
    throw new PaymentError(
      "Cashfree checkout is temporarily unavailable. Please retry.",
      response.status === 404 ? 404 : 502,
    );
  return (await response.json()) as T;
}
function validOrder(order: Order, id: string, amount = 10) {
  if (
    !order ||
    order.order_id !== id ||
    order.order_amount !== amount ||
    order.order_currency !== "INR"
  )
    throw new PaymentError("Could not validate this ₹10 payment.");
  return order;
}
export async function createOrder(
  requestId: string,
  phone: unknown,
  origin: string,
) {
  if (typeof phone !== "string" || !/^[6-9][0-9]{9}$/.test(phone))
    throw new PaymentError("Enter a valid 10-digit Indian mobile number.", 400);
  const id = orderIdFor(requestId);
  let order: Order;
  try {
    order = await request<Order>("/orders", {
      order_id: id,
      order_amount: 10,
      order_currency: "INR",
      customer_details: { customer_id: id, customer_phone: phone },
      order_note: "Campus Web ₹10 payment",
      order_meta: { return_url: origin + "/" },
    });
  } catch {
    // Recover an idempotent order after a duplicate request or lost response.
    order = await request<Order>("/orders/" + id);
  }
  validOrder(order, id);
  if (order.order_status === "ACTIVE" && !order.payment_session_id)
    throw new PaymentError("Cashfree did not return a checkout session.");
  return {
    order_id: id,
    order_status: order.order_status,
    order_amount: 10,
    order_currency: "INR",
    payment_session_id: order.payment_session_id,
  };
}
export async function verifyOrder(requestId: string) {
  const id = orderIdFor(requestId);
  let order: Order;
  try {
    order = validOrder(await request<Order>("/orders/" + id), id);
  } catch (error) {
    if (error instanceof PaymentError && error.status === 404)
      return { status: "not_created", order_id: id };
    throw error;
  }
  return paymentStatus(order, id, 10);
}

// CampusAPI creates these authenticated, account-bound orders. This endpoint
// only displays their receipt; CampusAPI alone fulfills the student's access.
export async function verifyAppOrder(orderId: unknown, amount: unknown) {
  if (
    typeof orderId !== "string" ||
    !/^cf_[a-f0-9]{40}$/.test(orderId) ||
    typeof amount !== "number" ||
    ![10, 12, 15, 20].includes(amount)
  ) {
    throw new PaymentError(
      "Invalid app checkout. Open payment from Campus App.",
      400,
    );
  }
  const order = validOrder(
    await request<Order>("/orders/" + orderId),
    orderId,
    amount,
  );
  return paymentStatus(order, orderId, amount);
}

async function paymentStatus(order: Order, id: string, amount: number) {
  if (["EXPIRED", "TERMINATED"].includes(order.order_status))
    return { status: "expired", order_id: id };
  if (order.order_status !== "PAID") return { status: "pending", order_id: id };
  const payments = await request<Payment[]>("/orders/" + id + "/payments");
  const paid =
    Array.isArray(payments) &&
    payments.some(
      (p) =>
        p.payment_status === "SUCCESS" &&
        p.payment_amount === amount &&
        p.payment_currency === "INR" &&
        p.cf_payment_id !== undefined &&
        p.cf_payment_id !== null,
    );
  return paid
    ? { status: "paid", order_id: id, amount, currency: "INR" }
    : { status: "pending", order_id: id };
}
