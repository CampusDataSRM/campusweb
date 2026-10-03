import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LEGAL_NAME, LEGAL_PAGES, TRADE_NAME } from "@/constants/legal";

export const metadata: Metadata = {
  title: "Legal & policies",
  description: `Policies of ${TRADE_NAME}, operated by ${LEGAL_NAME}.`,
};

export default function LegalCenterPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 font-extrabold text-on-surface">Legal &amp; policies</h1>
        <p className="text-on-surface-muted">
          Everything about what {TRADE_NAME} sells, what it costs, and how to reach us. {TRADE_NAME} is operated by {LEGAL_NAME}.
        </p>
      </header>
      <ul className="flex flex-col gap-2">
        {LEGAL_PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container p-5 transition-colors hover:border-outline hover:bg-surface-high"
            >
              <span className="flex flex-col gap-1">
                <span className="font-bold text-on-surface">{page.title}</span>
                <span className="text-sm text-on-surface-muted">{page.subtitle}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-on-surface-subtle" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
