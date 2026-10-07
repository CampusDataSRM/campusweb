import "../payment/checkout.css";
import type { Metadata } from "next";
import { AppPaymentCheckout } from "@/components/app-payment-checkout";
export const metadata: Metadata = { title: "Campus App payment" };
export default async function AppPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ embedded?: string }>;
}) {
  const embedded = (await searchParams).embedded === "1";
  return (
    <div className="cashfree-checkout">
      <AppPaymentCheckout embedded={embedded} />
    </div>
  );
}
