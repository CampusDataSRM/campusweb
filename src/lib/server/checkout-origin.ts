export class CheckoutOriginError extends Error {}

export function checkoutOrigin(request: Request) {
  // The hosting proxy may give Next.js an internal URL. Use the configured
  // public origin, never a client-supplied forwarded host.
  const configured =
    process.env.PAYMENT_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? new URL(request.url).origin
      : "https://payment.campusweb.in");
  let publicUrl: URL;
  try {
    publicUrl = new URL(configured);
  } catch {
    throw new CheckoutOriginError("Checkout website configuration is invalid.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(
    publicUrl.hostname,
  );
  if (
    publicUrl.username ||
    publicUrl.password ||
    publicUrl.search ||
    publicUrl.hash ||
    publicUrl.pathname !== "/" ||
    (publicUrl.protocol !== "https:" &&
      !(local && publicUrl.protocol === "http:"))
  ) {
    throw new CheckoutOriginError("Checkout website configuration is invalid.");
  }
  if (request.headers.get("origin") !== publicUrl.origin) {
    throw new CheckoutOriginError("Open checkout on this website to continue.");
  }
  return publicUrl.origin;
}
