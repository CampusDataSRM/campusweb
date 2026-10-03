import { Bricolage_Grotesque, Nunito } from "next/font/google";

/** Body and UI text - Campus App's typeface, rounded and highly legible. */
export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

/**
 * Headings and big numbers. Bricolage Grotesque is expressive - quirky
 * terminals, optical sizing - which gives the product a voice students
 * recognise, while staying crisp at stat sizes.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});
