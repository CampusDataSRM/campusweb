import type { Metadata } from "next";
import { PaymentView } from "@/components/payment/payment-view";

export const metadata: Metadata = { title: "Pay ₹10" };

export default function PaymentPage() {
  return <PaymentView />;
}
