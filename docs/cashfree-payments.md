# Cashfree ₹10 checkout

Signed-in students can open `/student/payment` from **Pay ₹10** in the header,
sidebar, or mobile More menu. This adds an optional checkout; it does not impose
a new access gate on existing student pages. Demo and guest accounts cannot pay.

The web app reuses CampusAPI's production payment contract and existing webhook:

- `POST /auth/payment/cashfree/order`: `{ amount: 10, request_id }`.
- `POST /auth/payment/cashfree/verify`: `{ order_id }`.
- Authentication uses the existing student request headers and, for Student
  Portal accounts, the API-origin HttpOnly session cookie.

Configure `NEXT_PUBLIC_SERVE` with the API base (including `/api`). Cashfree keys
stay in CampusAPI; no payment secrets or additional web environment variables
are required. The deployed web domain must be whitelisted in Cashfree and allowed
by CampusAPI's CORS configuration.

Checkout uses the official v3 browser SDK in production mode with `_modal`.
Only a matching, active Cashfree payment confirmed by CampusAPI produces the
success screen. HTTP 409 remains pending. A per-account local storage entry
retains the request/order IDs across refreshes; retries reuse the request ID,
and confirmed expired/terminated orders get a fresh one. Storage contains no
credentials or payment method information. If the browser refuses storage,
checkout stops before creating an untracked order.

Reference: https://www.cashfree.com/docs/payments/online/web/redirect

Validation: production build, TypeScript, focused ESLint, and desktop/mobile
browser checks with mocked Cashfree/API responses. A real production transaction
and provider domain configuration still need verification on the deployed site.
