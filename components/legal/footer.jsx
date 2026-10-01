import Link from "next/link";
import {
  LEGAL_NAME,
  PAYMENT_PROCESSOR,
  SUPPORT_EMAIL,
  TRADE_NAME,
} from "@/constants/legal";

const FOOTER_LINKS = [
  { href: "/legal", label: "Legal" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/shipping-policy", label: "Delivery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

// The operator's legal name on every public page, as payment providers
// require, with links to every policy.
const LegalFooter = ({ className = "" }) => (
  <footer
    className={`text-center text-xs leading-relaxed text-theme_text_normal_60 ${className}`}
  >
    <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 mb-2">
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-theme_text_primary hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
    <p>
      © {new Date().getFullYear()} {LEGAL_NAME} · {TRADE_NAME}
    </p>
    <p>
      {TRADE_NAME} is operated by {LEGAL_NAME}. Payments are processed
      securely by {PAYMENT_PROCESSOR}.
    </p>
    <p>
      <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">
        {SUPPORT_EMAIL}
      </a>
    </p>
  </footer>
);

export default LegalFooter;
