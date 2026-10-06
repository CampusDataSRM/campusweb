import { NextResponse } from "next/server";
import { checkoutOrigin, CheckoutOriginError } from "./checkout-origin";
import {
  createOrder,
  PaymentError,
  validateRequestId,
  verifyOrder,
} from "./cashfree";

export async function handlePayment(
  request: Request,
  action: "order" | "verify",
) {
  try {
    const origin = checkoutOrigin(request);
    if (Number(request.headers.get("content-length")) > 2048)
      throw new PaymentError("Invalid checkout request.", 400);
    const body = await request.json().catch(() => {
      throw new PaymentError("Invalid checkout request.", 400);
    });
    const id = validateRequestId(body?.request_id);
    const data =
      action === "order"
        ? await createOrder(id, body.phone, origin)
        : await verifyOrder(id);
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
