import { Clock3, DoorOpen } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SITE, STORE_LINKS } from "@/constants/site";

/** What a student sees on sign-in day one - shown, not described. */
const PREVIEW = {
  subject: "Compiler Design",
  time: "10:40 AM to 11:30 AM",
  room: "TP 1201",
  minutes: 12,
  skip: 4,
} as const;

/** A static, non-interactive preview of the dashboard's Now board. */
function NowBoardPreview() {
  return (
    <div aria-hidden className="relative w-full max-w-md rotate-[-1.5deg] rounded-[1.75rem] border border-outline-variant bg-surface-container p-6 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-highest px-3 py-1 text-sm font-bold text-on-surface-muted">
            <span className="size-2 rounded-full bg-primary-accent" /> Up next
          </span>
          <p className="font-heading text-3xl leading-none font-extrabold tracking-tight text-on-surface">{PREVIEW.subject}</p>
          <p className="flex flex-wrap gap-x-4 text-sm font-semibold text-on-surface-muted">
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4 text-primary-accent" />{PREVIEW.time}</span>
            <span className="inline-flex items-center gap-1.5"><DoorOpen className="size-4 text-primary-accent" />{PREVIEW.room}</span>
          </p>
        </div>
        <p className="text-right font-heading text-5xl leading-none font-extrabold text-on-surface">
          {PREVIEW.minutes}
          <span className="block text-sm font-bold text-on-surface-muted">mins to go</span>
        </p>
      </div>
      <p className="mt-5 flex w-fit items-center gap-3 rounded-2xl bg-secondary-container px-4 py-2.5 text-on-secondary-container">
        <span className="font-heading text-2xl font-extrabold">{PREVIEW.skip}</span>
        <span className="text-sm font-semibold">You can skip {PREVIEW.skip} more and stay above 75%</span>
      </p>
    </div>
  );
}

/** Brand side of the sign-in screen. Server-rendered. */
export function SignInHero() {
  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      <Logo variant="stacked" priority className="w-24 sm:w-28 lg:w-32" />
      <div className="flex flex-col gap-4">
        {/* Real text in the server HTML (it is the largest paint), with a
            CSS entrance that needs no JavaScript and honours reduced motion. */}
        <h1 className="animate-in fade-in slide-in-from-bottom-3 font-heading text-display font-extrabold text-on-surface duration-700 ease-out">
          {SITE.tagline}
        </h1>
        <p className="hidden max-w-md text-base leading-relaxed text-on-surface-muted sm:block lg:text-lg">
          {SITE.description}
        </p>
      </div>
      <div className="hidden sm:block">
        <NowBoardPreview />
      </div>
      <p className="hidden text-sm text-on-surface-subtle lg:block">
        Also on{" "}
        <a href={STORE_LINKS.playStore} target="_blank" rel="noreferrer" className="font-semibold text-on-surface-muted underline-offset-4 hover:underline">Android</a>{" "}
        and{" "}
        <a href={STORE_LINKS.appStore} target="_blank" rel="noreferrer" className="font-semibold text-on-surface-muted underline-offset-4 hover:underline">iPhone</a>.
      </p>
    </div>
  );
}
