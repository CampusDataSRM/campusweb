import { Nunito, Plus_Jakarta_Sans } from "next/font/google";

/** Body and UI text - the app's typeface, rounded and highly legible. */
export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

/** Headings and numbers - tighter, geometric, reads well at display sizes. */
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});
