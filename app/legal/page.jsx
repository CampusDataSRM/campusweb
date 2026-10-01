import Link from "next/link";
import LegalShell from "@/components/legal/legal-shell";
import { LEGAL_NAME, LEGAL_PAGES, TRADE_NAME } from "@/constants/legal";

export const metadata = {
  title: "Legal & policies · The Campus Web",
  description: `Policies of The Campus Web, operated by ${LEGAL_NAME}.`,
};

export default function LegalCenterPage() {
  return (
    <LegalShell
      title="Legal & policies"
      summary={`Everything about what ${TRADE_NAME} sells, what it costs, and how to reach us. ${TRADE_NAME} is operated by ${LEGAL_NAME}.`}
      showBack={false}
    >
      <div className="flex flex-col gap-3">
        {LEGAL_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="theme_box_bg p-5 flex items-center justify-between gap-4 hover:bg-[#0C4DA2]/30 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <span className="text-theme_text_primary font-semibold">
                {page.title}
              </span>
              <span className="text-theme_text_normal/70 text-sm">
                {page.subtitle}
              </span>
            </div>
            <img src="/icons/chevron/right.svg" alt="" className="h-7 w-auto flex-shrink-0" />
          </Link>
        ))}
      </div>
    </LegalShell>
  );
}
