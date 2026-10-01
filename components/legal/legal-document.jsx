import LegalShell from "@/components/legal/legal-shell";

// Renders one document from constants/legal.js.
const LegalDocument = ({ document, children }) => (
  <LegalShell title={document.title} summary={document.summary}>
    <div className="flex flex-col gap-3">
      {document.sections.map((section) => (
        <section key={section.heading} className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-2">
            {section.heading}
          </h2>
          {section.body && (
            <p className="text-theme_text_normal text-sm leading-relaxed">
              {section.body}
            </p>
          )}
          {section.points && (
            <ul className="mt-2 space-y-2 text-theme_text_normal text-sm">
              {section.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {children}
    </div>
  </LegalShell>
);

export default LegalDocument;
