import LegalDocument from "@/components/legal/legal-document";
import { LEGAL_NAME, termsAndConditions } from "@/constants/legal";

export const metadata = {
  title: "Terms & Conditions · The Campus Web",
  description: `Terms of use for The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function TermsPage() {
  return <LegalDocument document={termsAndConditions} />;
}
