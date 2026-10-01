import Link from "next/link";
import LegalFooter from "@/components/legal/footer";
import LegalNav from "@/components/legal/legal-nav";

// The frame every legal page shares: logo, a way back to the Legal page,
// the content, and the footer with the operator's legal name.
const LegalShell = ({ title, summary, children, showBack = true }) => (
  <>
    <LegalNav />
    <div className="max-h-screen overflow-auto pb-floatingNavHeight">
      <header className="flex items-center justify-between px-4 pt-8 pb-2">
        <Link href="/">
          <img src="/logo.svg" alt="The Campus Web" className="h-7" />
        </Link>
        {showBack && (
          <Link
            href="/legal"
            className="text-sm font-medium text-theme_text_primary hover:underline"
          >
            Legal & policies
          </Link>
        )}
      </header>
      <main className="px-4 pb-6">
        <div className="flex justify-start items-center gap-3 pt-6 pb-2">
          <img src="/icons/legal/secondary.svg" alt="" className="h-6 w-auto" />
          <h1 className="text-xl font-semibold text-theme_text_primary">
            {title}
          </h1>
        </div>
        {summary && (
          <p className="text-theme_text_normal/80 text-sm leading-relaxed pb-4">
            {summary}
          </p>
        )}
        {children}
      </main>
      <LegalFooter className="px-4 pb-8" />
    </div>
  </>
);

export default LegalShell;
