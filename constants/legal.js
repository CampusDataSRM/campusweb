// Single source of truth for the merchant and policy details shown on the
// website. Mirrors lib/screens/legal/legal_content.dart in CampusApp, so the
// website and the app say the same thing to students and to payment-provider
// reviewers. Change both together.

/// The person who operates the service - the name payment providers verify
/// against KYC and the settlement bank account.
export const LEGAL_NAME = "Ashutosh Anand";
/// The name the service trades under.
export const TRADE_NAME = "The Campus Web";
export const LEGAL_OPERATOR = `${LEGAL_NAME} (${TRADE_NAME})`;

export const SUPPORT_EMAIL = "yourcampusweb@gmail.com";
export const SUPPORT_PHONE = "+91 6205840930";
export const SUPPORT_PHONE_DIAL = "+916205840930";
export const WEBSITE_URL = "https://campusweb.in/";
export const INSTAGRAM_URL = "https://www.instagram.com/thecampusweb/";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.campusweb.campusapp";
export const APP_STORE_URL =
  "https://apps.apple.com/in/app/campus-app-the-all-in-one/id6760725730";

/// Mirrors paymentAccessDays in CampusAPI (cmd/utils/razorpay_payment.go).
export const ACCESS_DAYS = 30;
/// Mirrors allowedPaymentAmounts in CampusAPI. Every tier grants the same
/// ACCESS_DAYS of access; the higher amounts are voluntary support.
export const PLAN_AMOUNTS_INR = [10, 12, 15, 20];
export const CURRENCY_CODE = "INR";
export const PAYMENT_PROCESSOR = "Cashfree Payments";

/// Bump whenever any document below changes materially.
export const POLICY_LAST_UPDATED = "October 2026";

export const PLAN_INCLUSIONS = [
  "Full access to every feature of The Campus Web and Campus App",
  "Campus events and club discovery",
  "Your personal dashboard and planner",
  "Home screen widgets and offline access in the app",
];

export const termsAndConditions = {
  slug: "terms",
  title: "Terms & Conditions",
  summary:
    `These terms govern your use of ${TRADE_NAME} - this website and the ` +
    `Campus App mobile app - operated by ${LEGAL_NAME}. By signing in or ` +
    "purchasing access you agree to them.",
  sections: [
    {
      heading: "Who we are",
      body:
        `${TRADE_NAME} is operated by ${LEGAL_NAME}, an individual based in ` +
        `India. In these terms "we", "us" and "our" mean ${LEGAL_NAME}, ` +
        `trading as ${TRADE_NAME}.`,
    },
    {
      heading: "About the service",
      body:
        `${TRADE_NAME} is a platform for campus events and student life. ` +
        "Clubs register and publish their events, students discover clubs " +
        "and events, and a signed-in student sees a personalised dashboard " +
        "of their own information. It is an independent product and is not " +
        "affiliated with, endorsed by, or an official service of any " +
        "university, college or other organisation.",
    },
    {
      heading: "Who can use it",
      body:
        `${TRADE_NAME} is intended for currently enrolled students and for ` +
        "the clubs that organise campus events. You must be old enough to " +
        "enter a binding contract in your jurisdiction, or have the consent " +
        "of a parent or guardian.",
    },
    {
      heading: "Your account and session",
      points: [
        "Your username and password are used solely to sign you in and " +
          "retrieve your own records.",
        "You are responsible for keeping your device and session secure.",
        "Do not share your account, session or paid access with anyone else.",
        "We may end a session that appears compromised or misused.",
      ],
    },
    {
      heading: "Paid access",
      points: [
        `Paid access unlocks the full feature set for ${ACCESS_DAYS} days ` +
          "from the moment the payment is confirmed.",
        `All prices are listed and charged in Indian Rupees (${CURRENCY_CODE}).`,
        "Access is a one-time purchase. There is no subscription and nothing " +
          "renews automatically.",
        `Payments are processed by ${PAYMENT_PROCESSOR}. We never see or ` +
          "store your card, UPI or banking details.",
        "Access is verified on our server before it is activated.",
      ],
    },
    {
      heading: "Accuracy of information",
      body:
        "Information shown on the website and in the app mirrors what its " +
        "source reports at the time it was retrieved. It is shown for your " +
        "convenience and is not an official record. Always confirm anything " +
        "that matters against the original source before you act on it.",
    },
    {
      heading: "Events and clubs",
      body:
        "Events and club pages are published by the clubs themselves. Each " +
        "club is responsible for the accuracy of its own listings and for " +
        "running its own events. We may remove a listing that is misleading, " +
        "unlawful or breaks these terms.",
    },
    {
      heading: "Acceptable use",
      points: [
        "Do not attempt to access another student’s data.",
        "Do not scrape, resell, redistribute or reverse engineer the service.",
        "Do not disrupt, overload or probe our infrastructure.",
        "Do not use the service for anything unlawful.",
      ],
    },
    {
      heading: "Availability",
      body:
        "Some features depend on upstream services being reachable. They may " +
        "be temporarily unavailable during maintenance, downtime or changes " +
        "made upstream. We aim for continuous service but cannot guarantee " +
        "uninterrupted availability.",
    },
    {
      heading: "Governing law",
      body:
        "These terms are governed by the laws of India, and the courts of " +
        "India have jurisdiction over any dispute arising from them.",
    },
    {
      heading: "Changes to these terms",
      body:
        "We may update these terms as the service evolves. Material changes " +
        "will be reflected here. Continuing to use the service after an " +
        "update means you accept the revised terms.",
    },
    {
      heading: "Contact",
      body:
        `Questions about these terms can be sent to ${LEGAL_NAME} at ` +
        `${SUPPORT_EMAIL} or ${SUPPORT_PHONE}, and we will respond within 2 ` +
        "business days.",
    },
  ],
};

export const refundsAndCancellations = {
  slug: "refund-policy",
  title: "Refunds & Cancellations",
  summary:
    `Paid access to ${TRADE_NAME} is a digital product delivered ` +
    "immediately. This page explains when a refund is available and how to " +
    "request one.",
  sections: [
    {
      heading: "Immediate delivery",
      body:
        `Paid access is activated as soon as ${PAYMENT_PROCESSOR} confirms ` +
        "your payment and our server verifies it - usually within a few " +
        `seconds. The full ${ACCESS_DAYS} days of access are unlocked at ` +
        "that moment.",
    },
    {
      heading: "Refund policy",
      body:
        "Because access is delivered instantly and in full, payments are " +
        "non-refundable once access has been activated.",
    },
    {
      heading: "When we will refund you",
      body: "We will always refund the following:",
      points: [
        "You were charged more than once for the same access period.",
        "Money left your account but access was never activated.",
        "A transaction failed at the payment provider but was still debited.",
        "You were charged in error by us.",
      ],
    },
    {
      heading: "How to request a refund",
      points: [
        `Email ${SUPPORT_EMAIL} within 7 days of the charge.`,
        "Include your registration number and the order reference shown on " +
          "the payment screen.",
        "Attach the payment confirmation from your bank, UPI app or " +
          `${PAYMENT_PROCESSOR} if you have it.`,
      ],
    },
    {
      heading: "Processing time",
      body:
        "Approved refunds are returned to the original payment method. Once " +
        "we approve a request it is initiated within 2 business days, and " +
        "your bank or UPI provider typically credits it within 5–7 business " +
        "days.",
    },
    {
      heading: "Cancellations",
      body:
        "There is nothing to cancel. Access is a single one-time purchase " +
        `that simply expires after ${ACCESS_DAYS} days. No subscription is ` +
        "created, no payment method is stored, and you will never be charged " +
        "automatically.",
    },
    {
      heading: "Contact",
      body:
        `For anything refund related, write to ${LEGAL_NAME} at ` +
        `${SUPPORT_EMAIL}. We reply within 2 business days.`,
    },
  ],
};

export const shippingAndDelivery = {
  slug: "shipping-policy",
  title: "Shipping & Delivery",
  summary:
    `${TRADE_NAME} sells no physical goods. Nothing is shipped - paid ` +
    "access is delivered online, instantly.",
  sections: [
    {
      heading: "What is delivered",
      body:
        `The only product is ${ACCESS_DAYS} days of full access to ` +
        `${TRADE_NAME} and Campus App. It is a digital service; no physical ` +
        "item is ever shipped, and there are no shipping charges.",
    },
    {
      heading: "When it is delivered",
      body:
        `Access is activated as soon as ${PAYMENT_PROCESSOR} confirms your ` +
        "payment and our server verifies it - usually within a few seconds, " +
        "and always within 24 hours. It is delivered to the student account " +
        "that made the purchase, on the website and in the app alike.",
    },
    {
      heading: "If access is not activated",
      body:
        "If your payment went through but access was not activated, email " +
        `${SUPPORT_EMAIL} with your registration number and the order ` +
        "reference. We will activate it or refund you in full, as set out in " +
        "the Refunds & Cancellations policy.",
    },
  ],
};

export const privacyPolicy = {
  slug: "privacy-policy",
  title: "Privacy Policy",
  summary:
    `This notice explains what ${TRADE_NAME} - this website and the Campus ` +
    "App mobile app - collects, why, who it is shared with, and the rights " +
    "you have under the Digital Personal Data Protection Act, 2023. The data " +
    `fiduciary is ${LEGAL_NAME}. Last updated: ${POLICY_LAST_UPDATED}.`,
  sections: [
    {
      heading: "Summary",
      points: [
        "We collect what you give us, plus limited technical data needed to " +
          "run the service.",
        "We use it to sign you in, show you your own information, keep the " +
          "service secure and meet legal obligations.",
        "We do not sell your personal data, ever.",
        "The only credential we ever ask for is your username and password. " +
          "Nothing else.",
        "Your card, UPI and banking details never reach us at all - those go " +
          `straight to ${PAYMENT_PROCESSOR}.`,
        "You can ask us to access, correct or delete your data at any time.",
      ],
    },
    {
      heading: "Information you give us",
      points: [
        "Your username and password - and nothing else. We never ask for, " +
          "and never collect, one-time passwords, biometrics, Aadhaar, PAN, " +
          "card numbers, UPI IDs or bank details.",
        "They are used for one purpose only: signing you in so the service " +
          "can show you your own records.",
        "Your name, registration number, email and college details.",
        "Anything you enter yourself, such as planner entries, custom " +
          "subjects or feedback.",
        "For clubs: the club’s name, contact details and the events it " +
          "publishes.",
      ],
    },
    {
      heading: "Information collected automatically",
      points: [
        "Device type, browser, operating system and app version.",
        "IP address, used for rate limiting and abuse prevention.",
        "Basic usage events, such as which pages are opened, to find and fix " +
          "problems.",
        "Crash diagnostics, so we can fix what broke.",
      ],
    },
    {
      heading: "How your session is stored",
      body:
        "On the website, your session is held in a browser cookie and the " +
        "data shown to you is cached in your browser’s local storage, so " +
        "pages load quickly. In the app, the session is held in your " +
        "device’s encrypted secure storage - the Android Keystore or the " +
        "iOS Keychain. Signing out clears it in both places.",
    },
    {
      heading: "Cookies and analytics",
      body:
        "The website uses a small number of cookies and local storage " +
        "entries to keep you signed in. It may also use analytics tools " +
        "(Google Analytics, Microsoft Clarity and PostHog) to understand " +
        "which pages are used and to find problems. These tools receive " +
        "usage data, never your password.",
    },
    {
      heading: "Payment data",
      body:
        `Payments are handled entirely by ${PAYMENT_PROCESSOR}. Your card ` +
        "number, UPI ID, CVV, PIN and bank credentials are entered inside " +
        "their secure checkout and are never seen, transmitted or stored by " +
        "us. We keep only a payment reference, the amount, the currency and " +
        "the resulting access period so we know your access is valid.",
    },
    {
      heading: "Why we process your data",
      points: [
        "To create and maintain your account and session.",
        "To retrieve and display your own information.",
        "To publish and show campus events and clubs.",
        "To activate and verify paid access.",
        "To send notifications you have enabled, such as class reminders.",
        "To keep the service secure and prevent misuse.",
        "To comply with Indian law.",
      ],
    },
    {
      heading: "Legal basis (India)",
      body:
        "We process personal data under the Digital Personal Data Protection " +
        "Act, 2023, on the basis of your consent, to perform the service you " +
        "asked for, and to meet legal obligations. You may withdraw consent " +
        "at any time by writing to us; withdrawing it means we can no longer " +
        "provide the service.",
    },
    {
      heading: "Who we share it with",
      body: "We do not sell personal data. We share it only with:",
      points: [
        `${PAYMENT_PROCESSOR}, to process a payment you initiate.`,
        "Google Firebase, for website hosting, crash reporting and push " +
          "notifications.",
        "The analytics providers named above, for usage data only.",
        "Our hosting and database providers, who store data on our behalf " +
          "under confidentiality obligations.",
        "Authorities, where we are legally required to disclose it.",
      ],
    },
    {
      heading: "Storage and retention",
      body:
        "Data may be stored on servers in India or elsewhere, with " +
        "reasonable safeguards as required by law. We keep personal data " +
        "only as long as needed for the purposes above or as required by " +
        "law, after which it is securely deleted or anonymised. Ask us to " +
        "delete your account and we will remove your personal data within 30 " +
        "days, except records we must retain for tax or legal reasons.",
    },
    {
      heading: "Your rights",
      points: [
        "Access the personal data we hold about you.",
        "Correct anything inaccurate or incomplete.",
        "Request deletion of your data.",
        "Withdraw consent at any time.",
        "Nominate someone to exercise these rights on your behalf.",
        "Raise a grievance with us, and escalate to the Data Protection " +
          "Board of India if you are not satisfied.",
      ],
    },
    {
      heading: "Children",
      body:
        `${TRADE_NAME} is intended for college students and is not directed ` +
        "at children under 18. We do not knowingly collect data from a child " +
        "without verifiable parental consent. If you believe a child has " +
        `provided us data, write to ${SUPPORT_EMAIL} and we will delete it.`,
    },
    {
      heading: "Security",
      body:
        "We use encrypted transport (HTTPS) for everything and server-side " +
        "verification for all paid access. No system is perfectly secure, " +
        "but we work to protect your data and will notify you of a breach as " +
        "required by law.",
    },
    {
      heading: "Updates to this notice",
      body:
        "We may update this notice as the service changes. The revision date " +
        "at the top will change when we do.",
    },
    {
      heading: "Contact & grievance redressal",
      body:
        `Grievance officer: ${LEGAL_NAME}, ${TRADE_NAME} - ${SUPPORT_EMAIL}, ` +
        `${SUPPORT_PHONE}. We acknowledge grievances within 2 business days ` +
        "and aim to resolve them within 30 days, as required by the Digital " +
        "Personal Data Protection Act, 2023.",
    },
  ],
};

export const aboutUs = {
  slug: "about",
  title: "About Us",
  summary:
    `${TRADE_NAME} is built and run by ${LEGAL_NAME} - making campus events ` +
    "and campus life easier to keep up with.",
  sections: [
    {
      heading: "What we do",
      body:
        `${TRADE_NAME} brings campus clubs and events into one place. Clubs ` +
        "create their own account, publish their events, and keep their " +
        "profile and recruitment status up to date. Students browse clubs " +
        "and events, follow the ones they care about, and keep track of what " +
        "is happening around them - alongside a personalised dashboard of " +
        "their own information. It is available on this website and as " +
        "Campus App on Android and iOS.",
    },
    {
      heading: "Who runs it",
      body:
        `${TRADE_NAME} is operated by ${LEGAL_NAME}. We are independent: not ` +
        "affiliated with, endorsed by, or an official service of any " +
        "university, college or other organisation.",
    },
    {
      heading: "What we sell",
      body:
        `One product: ${ACCESS_DAYS} days of full access, priced in ` +
        `${CURRENCY_CODE} and shown in full on the Plans & Pricing page. It ` +
        "is a one-time payment, it does not renew, and no payment method is " +
        `stored. Payments are processed by ${PAYMENT_PROCESSOR}.`,
    },
    {
      heading: "Reaching us",
      body:
        `Email ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}. We reply within 2 ` +
        "business days. Full details are on the Contact Us page.",
    },
  ],
};

/// Every policy page, in the order the Legal page lists them.
export const LEGAL_PAGES = [
  { href: "/about", title: "About Us", subtitle: "Who we are and what we do" },
  { href: "/contact", title: "Contact Us", subtitle: "Email, phone and social links" },
  {
    href: "/terms",
    title: "Terms & Conditions",
    subtitle: `The agreement covering your use of ${TRADE_NAME}`,
  },
  {
    href: "/refund-policy",
    title: "Refunds & Cancellations",
    subtitle: "When we refund, and how to ask",
  },
  {
    href: "/shipping-policy",
    title: "Shipping & Delivery",
    subtitle: "Digital access, delivered instantly",
  },
  {
    href: "/privacy-policy",
    title: "Privacy Policy",
    subtitle: "What we collect, why, and your rights",
  },
  {
    href: "/pricing",
    title: "Plans & Pricing",
    subtitle: `${ACCESS_DAYS} days access · ₹${PLAN_AMOUNTS_INR[0]}–₹${
      PLAN_AMOUNTS_INR[PLAN_AMOUNTS_INR.length - 1]
    } ${CURRENCY_CODE}`,
  },
];
