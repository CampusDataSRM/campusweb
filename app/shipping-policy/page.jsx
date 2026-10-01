import LegalDocument from "@/components/legal/legal-document";
import { LEGAL_NAME, shippingAndDelivery } from "@/constants/legal";

export const metadata = {
  title: "Shipping & Delivery · The Campus Web",
  description: `Shipping and delivery policy of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function ShippingPolicyPage() {
  return <LegalDocument document={shippingAndDelivery} />;
}
