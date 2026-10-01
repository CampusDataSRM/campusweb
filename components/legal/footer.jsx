import { LEGAL_NAME, TRADE_NAME } from "@/constants/legal";

// The operator's legal name, as payment providers require, at the foot of
// every legal page.
const LegalFooter = ({ className = "" }) => (
  <footer
    className={`text-center text-xs text-theme_text_normal_60 ${className}`}
  >
    © {new Date().getFullYear()} {LEGAL_NAME} · {TRADE_NAME}
  </footer>
);

export default LegalFooter;
