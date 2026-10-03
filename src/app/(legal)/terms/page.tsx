import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_NAME, termsAndConditions } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms & Conditions of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function TermsPage() {
  return <LegalDocument document={termsAndConditions} />;
}
