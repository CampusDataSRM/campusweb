import { NextResponse } from "next/server";
import { checkoutOrigin, CheckoutOriginError } from "./checkout-origin";
import {
  createOrder,
  PaymentError,
  validateRequestId,
  verifyOrder,
  verifyAppOrder,
} from "./cashfree";

export async function handlePayment(
  request: Request,
  action: "order" | "verify" | "app-verify",
) {
  try {
    const origin = checkoutOrigin(request);
    if (Number(request.headers.get("content-length")) > 2048)
      throw new PaymentError("Invalid checkout request.", 400);
    const body = await request.json().catch(() => {
      throw new PaymentError("Invalid checkout request.", 400);
    });
    const data =
      action === "app-verify"
        ? await verifyAppOrder(body?.order_id, body?.amount)
        : action === "order"
          ? await createOrder(
              validateRequestId(body?.request_id),
              body.phone,
              origin,
            )
          : await verifyOrder(validateRequestId(body?.request_id));
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof PaymentError || error instanceof CheckoutOriginError
            ? error.message
            : "Secure checkout is temporarily unavailable. Please retry.",
      },
      {
        status:
          error instanceof CheckoutOriginError
            ? 403
            : error instanceof PaymentError
              ? error.status
              : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
