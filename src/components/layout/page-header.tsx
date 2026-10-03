import type { ReactNode } from "react";

/** A page's title row: heading, one-line context, and optional actions. */
export function PageHeader({
  title,
  description,
  actions,
  status,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h1 font-extrabold text-on-surface">{title}</h1>
          {status}
        </div>
        {description && (
          <p className="text-sm text-on-surface-muted sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/** A titled group inside a page. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className} aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-h3 font-bold text-on-surface">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
