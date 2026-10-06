import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
const font = DM_Sans({ subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: "Pay ₹10 · Campus Web",
  description: "A simple, secure ₹10 payment with Cashfree.",
  icons: { icon: "/logo_png.png" },
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
