import LegalShell from "@/components/legal/legal-shell";
import {
  ACCESS_DAYS,
  CURRENCY_CODE,
  LEGAL_NAME,
  PAYMENT_PROCESSOR,
  PLAN_AMOUNTS_INR,
  PLAN_INCLUSIONS,
  TRADE_NAME,
} from "@/constants/legal";

export const metadata = {
  title: "Plans & Pricing · The Campus Web",
  description: `${ACCESS_DAYS} days of full access to The Campus Web, operated by ${LEGAL_NAME}.`,
};

// A price list only. Nothing here takes a payment.
export default function PricingPage() {
  return (
    <LegalShell
      title="Plans & Pricing"
      summary={`${TRADE_NAME} sells one product: ${ACCESS_DAYS} days of full access. Choose any amount below - every tier unlocks exactly the same features. The higher amounts simply let you support development if you want to.`}
    >
      <div className="flex flex-col gap-3">
        <section className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-2">
            What every plan includes
          </h2>
          <ul className="space-y-2 text-theme_text_normal text-sm">
            {PLAN_INCLUSIONS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-theme_text_primary mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        {PLAN_AMOUNTS_INR.map((amount) => (
          <section
            key={amount}
            className="theme_box_bg p-5 flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-theme_text_primary font-semibold">
                {ACCESS_DAYS} days full access
              </span>
              <span className="text-theme_text_normal/70 text-sm">
                ₹{amount} {CURRENCY_CODE} · one-time · no renewal
              </span>
            </div>
            <span className="text-2xl font-bold text-theme_text_normal">
              ₹{amount}
            </span>
          </section>
        ))}
        <section className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-2">
            Billing
          </h2>
          <p className="text-theme_text_normal text-sm leading-relaxed">
            All prices are inclusive and charged in Indian Rupees (
            {CURRENCY_CODE}). This is a one-time payment for {ACCESS_DAYS} days
            of access - it does not renew and no payment method is stored.
            Payments are processed by {PAYMENT_PROCESSOR}, which supports UPI,
            debit and credit cards, net banking and wallets.
          </p>
        </section>
      </div>
    </LegalShell>
  );
}
