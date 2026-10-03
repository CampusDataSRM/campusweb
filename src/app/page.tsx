import type { Metadata } from "next";

import { ProductPreview } from "@/components/auth/product-preview";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignInHero } from "@/components/auth/sign-in-hero";

export const metadata: Metadata = {
  title: { absolute: "The Campus Web - Sign in" },
};

/**
 * Sign-in. Wide screens: the pitch and a live, tilting preview of the
 * dashboard on the left, the form on the right. Phones: pitch, form, then
 * the preview. proxy.ts sends signed-in students on to their dashboard.
 */
export default function SignInPage() {
  return (
    <main className="relative isolate flex min-h-dvh flex-1 items-center overflow-hidden px-page py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-[78rem] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-x-20 lg:gap-y-10">
        <SignInHero />

        <section
          aria-labelledby="sign-in-title"
          className="panel panel-raised relative animate-in fade-in slide-in-from-bottom-6 rounded-[2rem] p-6 duration-700 ease-out fill-mode-both [animation-delay:250ms] sm:p-9 lg:row-span-2"
        >
          {/* A thread of light along the top edge. */}
          <span aria-hidden className="absolute inset-x-12 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--primary-accent),transparent)]" />
          <div className="mb-7 flex flex-col gap-1.5">
            <h2 id="sign-in-title" className="text-h2 font-black text-on-surface">
              Sign in
            </h2>
            <p className="text-sm font-medium text-on-surface-muted">Use your student account. Takes ten seconds.</p>
          </div>
          <SignInForm />
        </section>

        {/* Full-size scene; scaled down as a whole on narrow screens so the
            composition never reflows. */}
        <div className="relative h-[16rem] w-full animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both [animation-delay:400ms] sm:h-[20rem] lg:h-auto">
          {/* Out of flow below lg, so its full width never widens the page. */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <ProductPreview className="origin-top scale-[0.64] sm:scale-[0.82] lg:scale-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
