import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_NAME, shippingAndDelivery } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: `Shipping & Delivery of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function ShippingPolicyPage() {
  return <LegalDocument document={shippingAndDelivery} />;
}
