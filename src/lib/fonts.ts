import { DM_Sans, Nunito, Space_Grotesk } from "next/font/google";

/** Campus App's typeface, used for everything - headings at heavy weights. */
export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

/** Clear reading face and an expressive, restrained display face. */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-home",
});
