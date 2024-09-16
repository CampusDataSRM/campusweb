import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Loader from "@/components/global/loader";
import { Suspense } from "react";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import Head from "next/head";
import Script from "next/script";

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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-C3JDRSD2G9" />
        <Script>
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments)}
          gtag('js', new Date());

          gtag('config', 'G-C3JDRSD2G9');`}
        </Script>
        <Suspense fallback={<Loader />}>
          <Image
            src="/bg_vector.png"
            alt="Create Next App"
            layout="fill"
            className="filter blur-[60px] fixed top-0 left-0 -z-50"
          />
          <div className="sm:hidden">{children}
            <Analytics />
            <SpeedInsights />
          </div>
        </Suspense>
      </body>
    </html>
  );
}
