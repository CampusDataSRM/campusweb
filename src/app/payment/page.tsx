import "../payment/checkout.css";
import { PaymentCheckout } from "@/components/payment-checkout";
export default function PaymentPage() {
  return (
    <div className="cashfree-checkout">
      <PaymentCheckout />
    </div>
  );
}
