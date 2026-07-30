import type { Metadata } from "next";
import Head from "next/head";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AmbientBackground } from "@/components/ambient-background";
import Script from "next/script";
import { GA_ID } from "@/constants";
import { plusJakartaSans, nunito } from "@/lib/fonts";
import "./globals.css";

const APP_NAME = "Campus Web";
const APP_DEFAULT_TITLE = "The Campus Web";
const APP_DESCRIPTION = "Your one-stop campus solution";
const APP_URL = "https://campusweb.in";

export const metadata: Metadata = {
  title: APP_DEFAULT_TITLE,
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/logo_png.png",
        alt: APP_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_DEFAULT_TITLE,
    description: APP_DESCRIPTION,
    site: APP_URL,
    creator: "campusweb",
    images: ["/logo_png.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${nunito.variable} dark h-full antialiased`}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta charSet="utf-8" />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="application-name" content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={APP_DEFAULT_TITLE} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={APP_DEFAULT_TITLE} />
        <meta name="twitter:description" content={APP_DESCRIPTION} />
        <meta name="twitter:site" content={APP_URL} />
        <meta name="twitter:creator" content="campusweb" />
        <meta name="twitter:images" content="/logo_png.png" />
      </Head>
      <body className="min-h-full flex flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="google-analytics">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments)}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}

        <AmbientBackground />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
