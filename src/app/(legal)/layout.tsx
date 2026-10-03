import { LegalShell } from "@/components/legal/legal-shell";

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LegalShell>{children}</LegalShell>;
}
