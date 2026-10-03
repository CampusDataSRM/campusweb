import { Logo } from "@/components/brand/logo";
import { SITE, STORE_LINKS } from "@/constants/site";

/** Brand side of the sign-in screen. Server-rendered; the entrance is CSS. */
export function SignInHero() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Logo priority className="h-6 w-fit animate-in fade-in duration-700 fill-mode-both sm:h-7" />
      <div className="flex flex-col gap-4">
        {/* Real text in the server HTML (it is the largest paint). */}
        <h1 className="max-w-[12ch] animate-in fade-in slide-in-from-bottom-4 text-[clamp(2.5rem,1.4rem+3.6vw,4.75rem)] leading-[0.98] font-black tracking-[-0.04em] text-balance text-on-surface duration-700 ease-out fill-mode-both [animation-delay:80ms]">
          {SITE.tagline}
        </h1>
        <p className="max-w-md animate-in fade-in slide-in-from-bottom-3 text-base leading-relaxed font-medium text-on-surface-muted duration-700 fill-mode-both [animation-delay:180ms] lg:text-lg">
          {SITE.description}
        </p>
      </div>
      <p className="hidden animate-in fade-in text-sm text-on-surface-subtle duration-700 fill-mode-both [animation-delay:600ms] lg:block">
        Also on{" "}
        <a href={STORE_LINKS.playStore} target="_blank" rel="noreferrer" className="font-bold text-on-surface-muted underline-offset-4 hover:text-on-surface hover:underline">Android</a>{" "}
        and{" "}
        <a href={STORE_LINKS.appStore} target="_blank" rel="noreferrer" className="font-bold text-on-surface-muted underline-offset-4 hover:text-on-surface hover:underline">iPhone</a>.
      </p>
    </div>
  );
}
