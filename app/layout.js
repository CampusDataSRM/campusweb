import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Loader from "@/components/global/loader";
import { Suspense } from "react";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Campus Web",
  description: "Your one-stop campus solution",
  manifest: "/manifest.json",
  applicationName: "Campus Web",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<Loader />}>
          <Image
            src="/bg_vector.png"
            alt="Create Next App"
            layout="fill"
            className="filter blur-[60px] fixed top-0 left-0 -z-50"
          />
          <div className="sm:hidden">{children}</div>
        </Suspense>
      </body>
    </html>
  );
}
