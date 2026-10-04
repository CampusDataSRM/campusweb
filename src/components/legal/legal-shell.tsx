import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { LEGAL_NAME, TRADE_NAME } from "@/constants/legal";
import { LEGAL_ROUTES } from "@/constants/routes";

/**
 * Frame for the public legal pages: logo, a way back to the Legal centre,
 * the content, and the operator's legal name - as payment providers require.
 * Server-rendered; no client JavaScript.
 */
export function LegalShell({
  children,
  back = true,
}: {
  children: ReactNode;
  back?: boolean;
}) {
  return (
    <div className="legal-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-page">
          <Link href="/" aria-label={`${TRADE_NAME} home`}>
            <Logo className="h-5" />
          </Link>
          {back && (
            <Link
              href={LEGAL_ROUTES.center}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
            >
              <ArrowLeft aria-hidden className="size-4" /> Legal &amp; policies
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-page py-8 sm:py-12">
        {children}
      </main>
      <footer className="border-t border-outline-variant py-6 text-center text-xs text-on-surface-subtle">
        © {new Date().getFullYear()} {LEGAL_NAME}, trading as {TRADE_NAME}
      </footer>
    </div>
  );
}
