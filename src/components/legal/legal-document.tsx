import type { ReactNode } from "react";

import type { LegalDocument as LegalDocumentData } from "@/constants/legal";

/** Renders one policy document: title, summary, then its sections. */
export function LegalDocument({ document, children }: { document: LegalDocumentData; children?: ReactNode }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 font-extrabold text-on-surface">{document.title}</h1>
        <p className="text-base leading-relaxed text-on-surface-muted sm:text-lg">{document.summary}</p>
      </header>
      {document.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-h3 font-bold text-on-surface">{section.heading}</h2>
          {section.body && <p className="leading-relaxed text-on-surface-muted">{section.body}</p>}
          {section.points && (
            <ul className="flex flex-col gap-2 pl-1">
              {section.points.map((point) => (
                <li key={point} className="flex gap-3 leading-relaxed text-on-surface-muted">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {children}
    </article>
  );
}
