import { apiClient, ApiError } from "@/lib/api/axios-client";
import { studentRequestConfig } from "@/lib/api/request-config";
import type { StudentSession } from "@/lib/auth/session";

export const CHECKOUT_AMOUNT = 10;

export interface CashfreeOrder {
  order_id: string;
  payment_session_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  environment: string;
}

export interface VerifiedPayment {
  provider: string;
  is_active: boolean;
  selected_amount: number;
  last_order_id: string;
  valid_till: string;
}

function config(session: StudentSession) {
  if (session.kind !== "academia" && session.kind !== "student-portal") {
    throw new Error("Sign in with your student account to pay.");
  }
  return { ...studentRequestConfig(session), timeout: 30_000 };
}

export async function createCashfreeOrder(
  session: StudentSession,
  requestId: string,
) {
  const { data } = await apiClient.post<{
    status: string;
    data: CashfreeOrder;
  }>(
    "/auth/payment/cashfree/order",
    { amount: CHECKOUT_AMOUNT, request_id: requestId },
    config(session),
  );
  const order = data.data;
  if (
    data.status !== "success" ||
    !order ||
    order.environment !== "production" ||
    order.order_amount !== CHECKOUT_AMOUNT ||
    order.order_currency !== "INR" ||
    !/^cf_[a-f0-9]{40}$/.test(order.order_id) ||
    !order.payment_session_id
  ) {
    throw new Error(
      "Secure checkout returned an invalid order. Please contact support.",
    );
  }
  return order;
}

export async function verifyCashfreePayment(
  session: StudentSession,
  orderId: string,
) {
  const { data } = await apiClient.post<{
    status: string;
    data: VerifiedPayment;
  }>("/auth/payment/cashfree/verify", { order_id: orderId }, config(session));
  const payment = data.data;
  if (
    data.status !== "success" ||
    !payment ||
    payment.provider !== "cashfree" ||
    !payment.is_active ||
    payment.selected_amount !== CHECKOUT_AMOUNT ||
    payment.last_order_id !== orderId
  ) {
    throw new ApiError("Payment is still being confirmed.", 409);
  }
  return payment;
}

export function paymentErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
      case 403:
        return "Your session expired. Sign in again before paying.";
      case 409:
        return "Payment is still being confirmed. If you paid, check the status before trying again.";
      case 429:
        return "Too many requests. Wait a minute and try again.";
      case 503:
        return "Secure checkout is temporarily unavailable. Please try again later.";
    }
  }
  return error instanceof Error
    ? error.message
    : "Could not complete checkout. Please try again.";
}
