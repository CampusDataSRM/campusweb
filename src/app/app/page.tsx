import type { Metadata } from "next";
import { AppPaymentCheckout } from "@/components/app-payment-checkout";
export const metadata: Metadata = { title: "Campus App payment" };
export default function AppPaymentPage() {
  return <AppPaymentCheckout />;
}
