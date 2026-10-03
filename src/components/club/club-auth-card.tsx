import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

/** The centred card every public club page uses (sign in, sign up, reset). */
export function ClubAuthCard({
  title,
  description,
  children,
  footer,
  wide,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-page py-10">
      <div className="relative flex flex-col items-center gap-2 text-center">
        <Logo className="h-6" />
        <p className="text-sm font-bold text-on-surface-brand">Club portal</p>
      </div>
      <section className={`relative w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-3xl border border-outline-variant bg-surface-container/95 p-6 shadow-2xl shadow-black/40 sm:p-8`}>
        <div className="mb-6 flex flex-col gap-1.5">
          <h1 className="text-h2 font-bold text-on-surface">{title}</h1>
          {description && <p className="text-sm text-on-surface-muted">{description}</p>}
        </div>
        {children}
      </section>
      {footer && <div className="relative flex flex-col items-center gap-2 text-sm">{footer}</div>}
    </main>
  );
}
