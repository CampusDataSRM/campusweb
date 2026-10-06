import { NextResponse } from "next/server";
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
    const url = new URL(request.url);
    if (request.headers.get("origin") !== url.origin)
      throw new PaymentError("Open checkout on this website to continue.", 403);
    if (Number(request.headers.get("content-length")) > 2048)
      throw new PaymentError("Invalid checkout request.", 400);
    const body = await request.json().catch(() => {
      throw new PaymentError("Invalid checkout request.", 400);
    });
    const id = validateRequestId(body?.request_id);
    const data =
      action === "order"
        ? await createOrder(id, body.phone, url.origin)
        : await verifyOrder(id);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof PaymentError
            ? error.message
            : "Secure checkout is temporarily unavailable. Please retry.",
      },
      {
        status: error instanceof PaymentError ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
