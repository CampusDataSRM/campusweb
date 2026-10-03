import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_NAME, refundsAndCancellations } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Refunds & Cancellations",
  description: `Refunds & Cancellations of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function RefundPolicyPage() {
  return <LegalDocument document={refundsAndCancellations} />;
}
