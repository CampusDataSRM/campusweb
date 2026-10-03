import type { Metadata } from "next";

import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInHero } from "@/components/auth/sign-in-hero";

export const metadata: Metadata = {
  title: { absolute: "The Campus Web - Sign in" },
};

/**
 * Sign-in. Phones: brand above the form. Wide screens: brand and form side
 * by side, the form in a raised panel. proxy.ts sends signed-in students on
 * to their dashboard before this renders.
 */
export default function SignInPage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 items-center justify-center overflow-hidden px-page py-8 sm:py-12">
      <div className="relative grid w-full max-w-content items-center gap-7 sm:gap-10 lg:grid-cols-[1.1fr_minmax(0,28rem)] lg:gap-16">
        <SignInHero />
        <section
          aria-labelledby="sign-in-title"
          className="rounded-3xl border border-outline-variant bg-surface-container/90 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-1.5">
            <h2 id="sign-in-title" className="text-h2 font-bold text-on-surface">
              Welcome back
            </h2>
            <p className="text-sm text-on-surface-muted">
              Sign in with your student account.
            </p>
          </div>
          <SignInForm />
        </section>
      </div>
    </main>
  );
}
