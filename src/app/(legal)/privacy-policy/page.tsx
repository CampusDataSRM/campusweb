import type { Metadata } from "next";

import { LegalDocument } from "@/components/legal/legal-document";
import { LEGAL_NAME, privacyPolicy } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function PrivacyPolicyPage() {
  return <LegalDocument document={privacyPolicy} />;
}
