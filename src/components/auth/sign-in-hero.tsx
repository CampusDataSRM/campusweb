import {
  BarChart3,
  CalendarDays,
  Clock3,
  Percent,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SITE, STORE_LINKS } from "@/constants/site";

const FEATURES: ReadonlyArray<{ label: string; icon: LucideIcon }> = [
  { label: "Attendance", icon: Percent },
  { label: "Timetable", icon: Clock3 },
  { label: "Marks", icon: BarChart3 },
  { label: "Planner", icon: CalendarDays },
  { label: "Events", icon: Sparkles },
  { label: "Clubs", icon: UsersRound },
];

/** Brand side of the sign-in screen. Server-rendered; only the headline animates. */
export function SignInHero() {
  return (
    <div className="flex flex-col gap-5 lg:gap-8">
      <Logo variant="stacked" priority className="w-24 sm:w-28 lg:w-36" />

      <div className="flex flex-col gap-3">
        <p className="text-xs font-extrabold tracking-[0.24em] text-on-surface-brand uppercase">
          Your academic command centre
        </p>
        {/* Real text in the server HTML (it is the largest paint), with a
            CSS entrance that needs no JavaScript and honours reduced motion. */}
        <h1 className="animate-in fade-in slide-in-from-bottom-3 font-heading text-display font-extrabold text-on-surface duration-700 ease-out">
          {SITE.tagline}
        </h1>
        <p className="hidden max-w-md text-base leading-relaxed text-on-surface-muted sm:block lg:text-lg">
          {SITE.description} Always up to date, on any device.
        </p>
      </div>

      <ul className="hidden flex-wrap gap-2 sm:flex" aria-label="What's inside">
        {FEATURES.map(({ label, icon: Icon }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container/80 px-3 py-1.5 text-sm font-semibold text-on-surface-muted"
          >
            <Icon aria-hidden className="size-4 text-primary-accent" />
            {label}
          </li>
        ))}
      </ul>

      <p className="hidden text-sm text-on-surface-subtle lg:block">
        Also on{" "}
        <a href={STORE_LINKS.playStore} target="_blank" rel="noreferrer" className="font-semibold text-on-surface-muted underline-offset-4 hover:underline">
          Android
        </a>{" "}
        and{" "}
        <a href={STORE_LINKS.appStore} target="_blank" rel="noreferrer" className="font-semibold text-on-surface-muted underline-offset-4 hover:underline">
          iPhone
        </a>
        .
      </p>
    </div>
  );
}
