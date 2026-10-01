import LegalDocument from "@/components/legal/legal-document";
import { LEGAL_NAME, refundsAndCancellations } from "@/constants/legal";

export const metadata = {
  title: "Refunds & Cancellations · The Campus Web",
  description: `Refund and cancellation policy of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function RefundPolicyPage() {
  return <LegalDocument document={refundsAndCancellations} />;
}
