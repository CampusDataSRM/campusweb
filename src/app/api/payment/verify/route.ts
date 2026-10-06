import { handlePayment } from "@/lib/server/payment-handler";
export const runtime = "nodejs";
export async function POST(request: Request) {
  return handlePayment(request, "verify");
}
