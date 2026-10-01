import LegalDocument from "@/components/legal/legal-document";
import { LEGAL_NAME, privacyPolicy } from "@/constants/legal";

export const metadata = {
  title: "Privacy Policy · The Campus Web",
  description: `Privacy policy of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function PrivacyPolicyPage() {
  return <LegalDocument document={privacyPolicy} />;
}
