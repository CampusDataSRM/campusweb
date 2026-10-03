import { Nunito } from "next/font/google";

/** Campus App's typeface, used for everything - headings at heavy weights. */
export const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});
